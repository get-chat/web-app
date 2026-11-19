import React, { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PubSub from 'pubsub-js';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';
import { Input } from '@src/components/ui/input';
import { Textarea } from '@src/components/ui/textarea';
import { Spinner } from '@src/components/ui/spinner';
import InfoIcon from '@src/components/icons/Info';
import { cn } from '@src/lib/utils';
import {
	createWhatsAppGroup,
	fetchWhatsAppGroup,
} from '@src/api/whatsappGroupsApi';
import {
	WhatsAppGroup,
	WhatsAppGroupJoinApprovalMode,
	WhatsAppGroupUpdateEvent,
} from '@src/types/whatsappGroups';
import {
	WHATSAPP_GROUP_DESCRIPTION_MAX_LENGTH,
	WHATSAPP_GROUP_MAX_PARTICIPANTS,
	WHATSAPP_GROUP_SUBJECT_MAX_LENGTH,
	getWhatsAppGroupErrorMessage,
} from '@src/helpers/WhatsAppGroupHelper';
import { EVENT_TOPIC_WHATSAPP_GROUP_UPDATE } from '@src/Constants';

// While WhatsApp creates the group: ask every 2 s, for a minute at most
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60000;

interface Props {
	open: boolean;
	onClose: () => void;
	/** The group exists: open its chat */
	onCreated: (waId: string) => void;
}

const labelClassName = 'text-[13px] font-semibold text-ink/80';
const counterClassName = 'text-[12px] text-ink/45 tabular-nums';

const JoinModeOption: React.FC<{
	isSelected: boolean;
	title: string;
	description: string;
	onSelect: () => void;
}> = ({ isSelected, title, description, onSelect }) => (
	<button
		type="button"
		role="radio"
		aria-checked={isSelected}
		className={cn(
			'flex w-full cursor-pointer items-start gap-3 rounded-[12px] border bg-white px-3.5 py-3 text-left transition-[border-color,background-color,box-shadow] duration-150 outline-none! focus-visible:ring-[3px] focus-visible:ring-primary/25',
			isSelected
				? 'border-primary bg-primary/5 shadow-[0_0_0_1px_var(--color-primary)]'
				: 'border-ink/10 hover:border-ink/25'
		)}
		onClick={onSelect}
	>
		<span
			className={cn(
				'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px]',
				isSelected ? 'border-primary' : 'border-ink/30'
			)}
		>
			{isSelected && <span className="size-2 rounded-full bg-primary" />}
		</span>
		<span className="flex flex-col gap-0.5">
			<span className="text-[14px] font-medium text-ink">{title}</span>
			<span className="text-[12.5px]/4.5 text-ink/55">{description}</span>
		</span>
	</button>
);

/**
 * Creates a WhatsApp group: a subject, an optional description and who can
 * join through the invite link. WhatsApp may take a moment to create it, so
 * the dialog waits (polling, or the whatsapp_group_update event) before it
 * opens the new chat.
 */
const CreateGroupDialog: React.FC<Props> = ({ open, onClose, onCreated }) => {
	const { t } = useTranslation();
	const subjectId = useId();
	const descriptionId = useId();

	const [subject, setSubject] = useState('');
	const [description, setDescription] = useState('');
	const [joinMode, setJoinMode] =
		useState<WhatsAppGroupJoinApprovalMode>('approval_required');
	const [isSubmitting, setSubmitting] = useState(false);
	const [creatingGroup, setCreatingGroup] = useState<WhatsAppGroup>();
	const [isTakingLong, setTakingLong] = useState(false);
	const [error, setError] = useState<string>();

	const onCreatedRef = useRef(onCreated);
	onCreatedRef.current = onCreated;

	const trimmedSubject = subject.trim();
	const isValid =
		trimmedSubject.length > 0 &&
		trimmedSubject.length <= WHATSAPP_GROUP_SUBJECT_MAX_LENGTH &&
		description.length <= WHATSAPP_GROUP_DESCRIPTION_MAX_LENGTH;

	// A fresh form each time it opens
	useEffect(() => {
		if (open) {
			setSubject('');
			setDescription('');
			setJoinMode('approval_required');
			setSubmitting(false);
			setCreatingGroup(undefined);
			setTakingLong(false);
			setError(undefined);
		}
	}, [open]);

	const handleGroup = (group: WhatsAppGroup) => {
		if (group.status === 'active' && group.wa_id) {
			setCreatingGroup(undefined);
			// The chat list adds it, as on the websocket event
			PubSub.publish(EVENT_TOPIC_WHATSAPP_GROUP_UPDATE, {
				id: group.id,
				wa_id: group.wa_id,
				status: group.status,
			});
			onCreatedRef.current(group.wa_id);
			return true;
		}
		if (group.status === 'create_failed') {
			setCreatingGroup(undefined);
			setError(group.error || t('WhatsApp could not create the group.'));
			return true;
		}
		return false;
	};

	// Waits for WhatsApp to create the group
	useEffect(() => {
		if (!creatingGroup) return;

		let isDone = false;
		const check = async () => {
			if (isDone) return;
			try {
				const group = await fetchWhatsAppGroup(creatingGroup.id);
				if (!isDone && handleGroup(group)) isDone = true;
			} catch (error) {
				console.error(error);
			}
		};

		const interval = setInterval(check, POLL_INTERVAL_MS);
		const timeout = setTimeout(() => {
			clearInterval(interval);
			if (!isDone) setTakingLong(true);
		}, POLL_TIMEOUT_MS);

		const token = PubSub.subscribe(
			EVENT_TOPIC_WHATSAPP_GROUP_UPDATE,
			(msg: string, data: WhatsAppGroupUpdateEvent) => {
				if (data.id === creatingGroup.id) check();
			}
		);

		return () => {
			isDone = true;
			clearInterval(interval);
			clearTimeout(timeout);
			PubSub.unsubscribe(token);
		};
	}, [creatingGroup]);

	const submit = async (event?: React.FormEvent) => {
		event?.preventDefault();
		if (!isValid || isSubmitting || creatingGroup) return;

		setSubmitting(true);
		setError(undefined);
		try {
			const group = await createWhatsAppGroup({
				subject: trimmedSubject,
				description: description.trim() || undefined,
				join_approval_mode: joinMode,
			});
			if (!handleGroup(group)) {
				setCreatingGroup(group);
			}
		} catch (error) {
			setError(
				getWhatsAppGroupErrorMessage(
					error,
					t('The group could not be created. Please try again.')
				)
			);
		} finally {
			setSubmitting(false);
		}
	};

	const isCreating = Boolean(creatingGroup);

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent size="xs" showCloseButton>
				<form className="flex min-h-0 flex-col" onSubmit={submit}>
					<DialogHeader>
						<DialogTitle>{t('Create group')}</DialogTitle>
					</DialogHeader>

					{isCreating ? (
						<DialogBody className="flex flex-col items-center gap-3 py-10 text-center">
							{isTakingLong ? (
								<p className="m-0 max-w-[320px] text-[14px] text-ink/70">
									{t(
										'WhatsApp is taking longer than usual. The group will appear in your chats once it is ready.'
									)}
								</p>
							) : (
								<>
									<Spinner size={28} className="text-primary" />
									<p className="m-0 text-[14px] font-medium text-ink/70">
										{t('Creating group…')}
									</p>
								</>
							)}
						</DialogBody>
					) : (
						<DialogBody className="flex flex-col gap-4 pb-1">
							<div className="flex flex-col gap-1.5">
								<div className="flex items-baseline justify-between">
									<label htmlFor={subjectId} className={labelClassName}>
										{t('Subject')}
									</label>
									<span className={counterClassName}>
										{subject.length}/{WHATSAPP_GROUP_SUBJECT_MAX_LENGTH}
									</span>
								</div>
								<Input
									id={subjectId}
									value={subject}
									maxLength={WHATSAPP_GROUP_SUBJECT_MAX_LENGTH}
									placeholder={t('e.g. Acme onboarding')}
									autoFocus
									onChange={(event) => setSubject(event.target.value)}
									data-test-id="group-subject-input"
								/>
							</div>

							<div className="flex flex-col gap-1.5">
								<div className="flex items-baseline justify-between">
									<label htmlFor={descriptionId} className={labelClassName}>
										{t('Description')}
									</label>
									<span className={counterClassName}>
										{t('Optional')} · {description.length}/
										{WHATSAPP_GROUP_DESCRIPTION_MAX_LENGTH}
									</span>
								</div>
								<Textarea
									id={descriptionId}
									value={description}
									maxLength={WHATSAPP_GROUP_DESCRIPTION_MAX_LENGTH}
									placeholder={t('What is this group for?')}
									className="max-h-40"
									onChange={(event) => setDescription(event.target.value)}
								/>
							</div>

							<div className="flex flex-col gap-2" role="radiogroup">
								<span className={labelClassName}>
									{t('Who can join with the invite link?')}
								</span>
								<JoinModeOption
									isSelected={joinMode === 'auto_approve'}
									title={t('Anyone with the link')}
									description={t('People who open the link join right away.')}
									onSelect={() => setJoinMode('auto_approve')}
								/>
								<JoinModeOption
									isSelected={joinMode === 'approval_required'}
									title={t('Approval required')}
									description={t(
										'People who open the link send a join request that you approve or reject.'
									)}
									onSelect={() => setJoinMode('approval_required')}
								/>
							</div>

							<div className="flex items-start gap-2.5 rounded-[12px] bg-ink/[0.04] px-3.5 py-3 text-[12.5px]/4.5 text-ink/65">
								<InfoIcon className="mt-px size-4! shrink-0 text-ink/45!" />
								<span>
									{t(
										'Up to %d participants. People can only join through the invite link: after creating the group, send the invite template to contacts.',
										WHATSAPP_GROUP_MAX_PARTICIPANTS
									)}
								</span>
							</div>
						</DialogBody>
					)}

					{error && (
						<div
							className="mx-5 mt-2 rounded-[10px] bg-destructive/8 px-3.5 py-2.5 text-[13px] text-destructive max-md:mx-[15px]"
							role="alert"
						>
							{error}
						</div>
					)}

					<DialogFooter className="mt-2 border-t border-ink/10 px-5 py-3 max-md:px-[15px]">
						<Button variant="outline" color="neutral" onClick={onClose}>
							{isCreating ? t('Close') : t('Cancel')}
						</Button>
						{!isCreating && (
							<Button
								type="submit"
								disabled={!isValid}
								loading={isSubmitting}
								data-test-id="create-group-submit"
							>
								{t('Create group')}
							</Button>
						)}
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateGroupDialog;
