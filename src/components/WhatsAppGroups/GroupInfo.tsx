import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import SidePanel from '@src/components/SidePanel';
import CustomAvatar from '@src/components/CustomAvatar';
import { ProfileSection } from '@src/components/ProfilePanel';
import { Button } from '@src/components/ui/button';
import { Input } from '@src/components/ui/input';
import { Textarea } from '@src/components/ui/textarea';
import { Progress } from '@src/components/ui/progress';
import { SimpleTooltip } from '@src/components/ui/tooltip';
import GroupsIcon from '@src/components/icons/Groups';
import PhotoCameraIcon from '@src/components/icons/PhotoCamera';
import EditIcon from '@src/components/icons/Edit';
import CheckIcon from '@src/components/icons/Check';
import CloseIcon from '@src/components/icons/Close';
import PersonRemoveIcon from '@src/components/icons/PersonRemove';
import PersonAddIcon from '@src/components/icons/PersonAdd';
import LinkIcon from '@src/components/icons/Link';
import ContentCopyIcon from '@src/components/icons/ContentCopy';
import SettingsBackupRestoreIcon from '@src/components/icons/SettingsBackupRestore';
import DeleteIcon from '@src/components/icons/Delete';
import { cn } from '@src/lib/utils';
import { PanelTransitionProps } from '@src/styles/panelTransitions';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setState } from '@src/store/reducers/UIReducer';
import useIsTenantReadOnly from '@src/hooks/useIsTenantReadOnly';
import {
	approveWhatsAppGroupJoinRequests,
	deleteWhatsAppGroup,
	rejectWhatsAppGroupJoinRequests,
	removeWhatsAppGroupParticipants,
	resetWhatsAppGroupInviteLink,
	updateWhatsAppGroup,
	uploadWhatsAppGroupPicture,
} from '@src/api/whatsappGroupsApi';
import {
	WhatsAppGroupDetail,
	WhatsAppGroupJoinRequest,
	WhatsAppGroupParticipant,
} from '@src/types/whatsappGroups';
import {
	WHATSAPP_GROUP_DESCRIPTION_MAX_LENGTH,
	WHATSAPP_GROUP_SUBJECT_MAX_LENGTH,
	canApproveJoinRequests,
	canSendToWhatsAppGroup,
	getGroupParticipantKey,
	getGroupParticipantName,
	getJoinApprovalModeLabel,
	getWhatsAppGroupErrorMessage,
	getWhatsAppGroupMaxParticipants,
	getWhatsAppGroupParticipantCount,
	getWhatsAppGroupStatusLabel,
	isWhatsAppGroupFull,
	validateWhatsAppGroupPicture,
} from '@src/helpers/WhatsAppGroupHelper';
import { addPlus } from '@src/helpers/PhoneNumberHelper';
import { useIsUserActionsRestricted } from '@src/hooks/useIsUserActionsRestricted';
import ConfirmDialog from './ConfirmDialog';
import AddParticipantsDialog from './AddParticipantsDialog';

// Like ProfileSectionHeader, with room for a count on the right
const sectionTitleClassName =
	'mb-2.5 flex items-center justify-between text-[14px] font-normal text-primary';

/** A white block on the panel's grey, like the contact details' */
const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<ProfileSection className="px-5 py-4">{children}</ProfileSection>
);

/** One fact: its name on the left, the value on the right */
const Row: React.FC<{ label: string; children: React.ReactNode }> = ({
	label,
	children,
}) => (
	<div className="flex items-baseline justify-between gap-4 py-1 text-[14px]">
		<span className="shrink-0 text-ink/60">{label}</span>
		<span className="min-w-0 text-right">{children}</span>
	</div>
);

// The small round icon buttons of a row
const rowIconButtonClassName =
	'size-7 rounded-full [&_.app-icon]:size-4.5! [&_.app-icon]:text-current!';

type Confirmation =
	| { type: 'remove'; participant: WhatsAppGroupParticipant }
	| { type: 'reset_link' }
	| { type: 'delete' };

/** A subject or description, editable in place */
const EditableField: React.FC<{
	label: string;
	value: string;
	maxLength: number;
	isMultiline?: boolean;
	isEditable: boolean;
	placeholder?: string;
	onSave: (value: string) => Promise<void>;
}> = ({
	label,
	value,
	maxLength,
	isMultiline = false,
	isEditable,
	placeholder,
	onSave,
}) => {
	const { t } = useTranslation();
	const [draft, setDraft] = useState<string>();
	const [isSaving, setSaving] = useState(false);

	const isEditing = draft !== undefined;
	const canSave =
		!isSaving &&
		draft !== undefined &&
		draft.trim() !== value &&
		(isMultiline || draft.trim().length > 0);

	const save = async () => {
		if (!canSave) return;
		setSaving(true);
		try {
			await onSave(draft.trim());
			setDraft(undefined);
		} catch {
			// Shown by onSave; the draft stays to try again
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="py-1.75">
			<div className="flex items-center justify-between gap-2">
				<span className="text-[13px] text-ink/60">{label}</span>
				{isEditing ? (
					<span className="text-[11.5px] text-ink/45 tabular-nums">
						{draft.length}/{maxLength}
					</span>
				) : (
					isEditable && (
						<SimpleTooltip title={t('Edit')} disableHoverableContent>
							<Button
								variant="ghost"
								color="neutral"
								size="none"
								className={cn(rowIconButtonClassName, 'text-ink/45')}
								aria-label={t('Edit') + ' ' + label}
								onClick={() => setDraft(value)}
							>
								<EditIcon />
							</Button>
						</SimpleTooltip>
					)
				)}
			</div>

			{isEditing ? (
				<div className="mt-1.5 flex flex-col gap-2">
					{isMultiline ? (
						<Textarea
							value={draft}
							maxLength={maxLength}
							autoFocus
							className="max-h-48 text-[13.5px]!"
							onChange={(event) => setDraft(event.target.value)}
						/>
					) : (
						<Input
							value={draft}
							maxLength={maxLength}
							autoFocus
							size="sm"
							onChange={(event) => setDraft(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter') save();
								if (event.key === 'Escape') {
									event.stopPropagation();
									setDraft(undefined);
								}
							}}
						/>
					)}
					<div className="flex justify-end gap-1.5">
						<Button
							variant="ghost"
							color="neutral"
							size="xs"
							onClick={() => setDraft(undefined)}
						>
							{t('Cancel')}
						</Button>
						<Button
							size="xs"
							disabled={!canSave}
							loading={isSaving}
							onClick={save}
						>
							{t('Save')}
						</Button>
					</div>
				</div>
			) : (
				<div
					className={cn(
						'mt-0.5 text-[14px]/5 whitespace-pre-wrap [word-break:break-word]',
						isMultiline ? 'font-normal text-ink/80' : 'font-semibold',
						!value && 'text-ink/40'
					)}
				>
					{value || placeholder}
				</div>
			)}
		</div>
	);
};

const PersonRow: React.FC<{
	name: string;
	waId?: string;
	detail?: React.ReactNode;
	children?: React.ReactNode;
}> = ({ name, waId, detail, children }) => {
	const isUserActionsRestricted = useIsUserActionsRestricted();
	// The number, unless it is the name already or hidden from this user
	const number =
		!isUserActionsRestricted && waId && name !== addPlus(waId)
			? addPlus(waId)
			: undefined;
	return (
		<div className="flex items-center gap-2.5 py-1.5">
			<CustomAvatar
				className="size-8 text-[12px]"
				generateBgColorBy={waId ?? name}
			>
				{name
					.split(' ')
					.map((part) => part[0])
					.join('')
					.slice(0, 2)
					.toUpperCase()}
			</CustomAvatar>
			<div className="flex min-w-0 flex-1 flex-col">
				<span className="truncate text-[13.5px]/5 font-medium">{name}</span>
				{(number || detail) && (
					<span className="truncate text-[12px]/4 text-ink/50 tabular-nums">
						{number}
						{number && detail ? ' · ' : null}
						{detail}
					</span>
				)}
			</div>
			{children}
		</div>
	);
};

/**
 * The open WhatsApp group chat's details, next to the chat like the contact
 * details: subject, description and picture, participants, join requests,
 * the invite link, and deleting the group. Live parts (participants, join
 * requests) come from the group's GET, which ChatView refreshes on every
 * whatsapp_group_update event for this group.
 */
const GroupInfo: React.FC<PanelTransitionProps> = ({
	isExiting,
	onAnimationEnd,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const group = useAppSelector((state) => state.UI.currentWhatsAppGroup);
	const isReadOnly = useAppSelector((state) => state.UI.isReadOnly);
	const businessNumber = useAppSelector((state) => state.phoneNumber.value);
	const isTenantReadOnly = useIsTenantReadOnly();
	const isUserActionsRestricted = useIsUserActionsRestricted();

	const [confirmation, setConfirmation] = useState<Confirmation>();
	const [isAddParticipantsOpen, setAddParticipantsOpen] = useState(false);
	const [busyJoinRequests, setBusyJoinRequests] = useState<string[]>([]);
	const [isUploadingPicture, setUploadingPicture] = useState(false);
	const pictureInput = useRef<HTMLInputElement>(null);

	const close = () => dispatch(setState({ isContactDetailsVisible: false }));

	if (!group) return null;

	const isActive = canSendToWhatsAppGroup(group);
	// Read-only inboxes (GC-72) and restricted users change nothing
	const canChange =
		!isReadOnly && !isTenantReadOnly && !isUserActionsRestricted;
	const canManage = isActive && canChange;
	const statusLabel = getWhatsAppGroupStatusLabel(group.status, t);
	const participantCount = getWhatsAppGroupParticipantCount(group);
	const maxParticipants = getWhatsAppGroupMaxParticipants(group);
	const isFull = isWhatsAppGroupFull(group);
	const joinRequests = group.join_requests ?? [];

	const showError = (error: any, fallback: string) =>
		window.displayCustomError(getWhatsAppGroupErrorMessage(error, fallback));

	// Shows a change right away. The group is read again from WhatsApp once,
	// when its whatsapp_group_update event comes (ChatView).
	const applyChanges = (changes: Partial<WhatsAppGroupDetail> = {}) => {
		dispatch(setState({ currentWhatsAppGroup: { ...group, ...changes } }));
	};

	const saveField = async (field: 'subject' | 'description', value: string) => {
		try {
			const updated = await updateWhatsAppGroup(group.id, { [field]: value });
			applyChanges(updated);
		} catch (error) {
			showError(error, t('The group could not be updated.'));
			throw error;
		}
	};

	const handlePicture = async (file: File | undefined) => {
		if (!file) return;
		const problem = await validateWhatsAppGroupPicture(file, t);
		if (problem) {
			window.displayCustomError(problem);
			return;
		}
		setUploadingPicture(true);
		try {
			await uploadWhatsAppGroupPicture(group.id, file);
			window.displaySuccess(t('The group picture was updated.'));
		} catch (error) {
			showError(error, t('The group picture could not be uploaded.'));
		} finally {
			setUploadingPicture(false);
		}
	};

	const handleJoinRequests = async (
		ids: string[],
		action: 'approve' | 'reject'
	) => {
		setBusyJoinRequests((prev) => [...prev, ...ids]);
		try {
			const result =
				action === 'approve'
					? await approveWhatsAppGroupJoinRequests(group.id, ids)
					: await rejectWhatsAppGroupJoinRequests(group.id, ids);
			if (result.failed?.length) {
				window.displayCustomError(
					result.failed.map((item) => item.error).join('\n')
				);
			}
			applyChanges({
				join_requests: joinRequests.filter(
					(request) =>
						!ids.includes(request.join_request_id) ||
						result.failed?.some(
							(item) => item.join_request_id === request.join_request_id
						)
				),
			});
		} catch (error) {
			showError(error, t('The join requests could not be answered.'));
		} finally {
			setBusyJoinRequests((prev) => prev.filter((id) => !ids.includes(id)));
		}
	};

	const copyInviteLink = async () => {
		if (!group.invite_link) return;
		try {
			await navigator.clipboard.writeText(group.invite_link);
			window.displaySuccess(t('Invite link copied'));
		} catch (error) {
			console.error(error);
		}
	};

	const confirmAction = async () => {
		if (!confirmation) return;
		try {
			if (confirmation.type === 'remove') {
				const { wa_id, user_id } = confirmation.participant;
				await removeWhatsAppGroupParticipants(group.id, [
					wa_id ? { wa_id } : { user_id: user_id ?? '' },
				]);
				applyChanges({
					participants: group.participants?.filter(
						(item) => item !== confirmation.participant
					),
					total_participant_count:
						participantCount !== undefined
							? Math.max(0, participantCount - 1)
							: undefined,
				});
			} else if (confirmation.type === 'reset_link') {
				const { invite_link } = await resetWhatsAppGroupInviteLink(group.id);
				applyChanges({ invite_link });
			} else {
				await deleteWhatsAppGroup(group.id);
				applyChanges({ status: 'deleted' });
				window.displaySuccess(
					t('The group is being deleted. Its chat stays readable.')
				);
				close();
			}
		} catch (error) {
			showError(error, t('Something went wrong. Please try again.'));
		}
	};

	const renderJoinRequestButtons = (request: WhatsAppGroupJoinRequest) => {
		const isBusy = busyJoinRequests.includes(request.join_request_id);
		const canApprove = canApproveJoinRequests(group, 1);
		return (
			<div className="flex shrink-0 gap-1">
				<SimpleTooltip title={t('Reject')} disableHoverableContent>
					<Button
						variant="unstyled"
						size="none"
						className={cn(
							rowIconButtonClassName,
							'bg-destructive/8 text-destructive hover:bg-destructive/15'
						)}
						aria-label={t('Reject')}
						disabled={isBusy || !canManage}
						onClick={() =>
							handleJoinRequests([request.join_request_id], 'reject')
						}
					>
						<CloseIcon />
					</Button>
				</SimpleTooltip>
				<SimpleTooltip
					title={canApprove ? t('Approve') : t('The group is full')}
					disableHoverableContent
				>
					{/* Hoverable while disabled, for the tooltip */}
					<span className="flex">
						<Button
							variant="unstyled"
							size="none"
							className={cn(
								rowIconButtonClassName,
								'bg-primary text-white hover:bg-primary-deep'
							)}
							aria-label={t('Approve')}
							disabled={isBusy || !canManage || !canApprove}
							onClick={() =>
								handleJoinRequests([request.join_request_id], 'approve')
							}
						>
							<CheckIcon />
						</Button>
					</span>
				</SimpleTooltip>
			</div>
		);
	};

	const isBusinessParticipant = (participant: WhatsAppGroupParticipant) =>
		Boolean(businessNumber) && participant.wa_id === businessNumber;

	return (
		<SidePanel
			className="z-10 min-w-0"
			title={t('Group info')}
			onClose={close}
			isExiting={isExiting}
			onAnimationEnd={onAnimationEnd}
		>
			<div
				className="relative flex flex-1 flex-col overflow-y-auto bg-gray-light"
				data-test-id="group-info"
			>
				{/* The group */}
				<ProfileSection className="flex flex-col items-center px-5 pt-6 pb-4">
					<div className="relative">
						<CustomAvatar
							className="size-28 [&_.app-icon]:size-12!"
							generateBgColorBy={group.subject}
						>
							<GroupsIcon />
						</CustomAvatar>
						{canManage && (
							<SimpleTooltip
								title={t('Change group picture')}
								disableHoverableContent
							>
								<Button
									variant="unstyled"
									size="none"
									className="absolute -right-0.5 -bottom-0.5 size-8 rounded-full bg-ink text-white shadow-[0_0_0_3px_#fff] hover:bg-ink/85 [&_.app-icon]:size-4.5! [&_.app-icon]:text-white!"
									aria-label={t('Change group picture')}
									loading={isUploadingPicture}
									onClick={() => pictureInput.current?.click()}
								>
									{!isUploadingPicture && <PhotoCameraIcon />}
								</Button>
							</SimpleTooltip>
						)}
						<input
							ref={pictureInput}
							type="file"
							accept="image/jpeg"
							className="hidden"
							onChange={(event) => {
								handlePicture(event.target.files?.[0]);
								event.target.value = '';
							}}
						/>
					</div>
					{statusLabel && (
						<span className="mt-3 rounded-full bg-destructive/10 px-2.5 py-0.5 text-[12px] font-semibold text-destructive">
							{statusLabel}
						</span>
					)}
				</ProfileSection>

				<Section>
					<EditableField
						label={t('Subject')}
						value={group.subject}
						maxLength={WHATSAPP_GROUP_SUBJECT_MAX_LENGTH}
						isEditable={canManage}
						onSave={(value) => saveField('subject', value)}
					/>
					<EditableField
						label={t('Description')}
						value={group.description}
						maxLength={WHATSAPP_GROUP_DESCRIPTION_MAX_LENGTH}
						isMultiline
						isEditable={canManage}
						placeholder={t('No description')}
						onSave={(value) => saveField('description', value)}
					/>
					<Row label={t('Join mode')}>
						{getJoinApprovalModeLabel(group.join_approval_mode, t)}
					</Row>
					{Boolean(group.created_timestamp) && (
						<Row label={t('Created')}>
							<Moment unix format="D MMM YYYY">
								{group.created_timestamp ?? undefined}
							</Moment>
						</Row>
					)}
				</Section>

				{group.live_error && (
					<div className="mx-5 mb-2.5 rounded-[10px] bg-warning-soft px-3.5 py-2.5 text-[12.5px] text-ink/75">
						{t('Participants could not be loaded from WhatsApp right now.')}
					</div>
				)}

				{isActive && (
					<Section>
						<div className={sectionTitleClassName}>
							<span>{t('Participants')}</span>
							{participantCount !== undefined && (
								<span
									className={cn(
										'text-[12.5px] tabular-nums',
										isFull ? 'text-destructive' : 'text-primary'
									)}
									data-test-id="participant-count"
								>
									{participantCount}/{maxParticipants}
								</span>
							)}
						</div>
						{participantCount !== undefined && (
							<Progress
								size="sm"
								color={isFull ? 'destructive' : 'primary'}
								value={Math.min(
									100,
									(participantCount / maxParticipants) * 100
								)}
							/>
						)}

						<SimpleTooltip
							title={isFull ? t('The group is full') : undefined}
							disableHoverableContent
						>
							<div className="mt-3 mb-1.5">
								<Button
									variant="outline"
									size="sm"
									className="w-full [&_.app-icon]:size-4.5! [&_.app-icon]:text-current!"
									disabled={!canManage || isFull}
									onClick={() => setAddParticipantsOpen(true)}
									data-test-id="add-participants"
								>
									<PersonAddIcon />
									{t('Add participants')}
								</Button>
							</div>
						</SimpleTooltip>

						{group.participants?.map((participant, index) => (
							<PersonRow
								key={getGroupParticipantKey(participant) || index}
								name={
									isBusinessParticipant(participant)
										? t('You')
										: getGroupParticipantName(participant)
								}
								waId={participant.wa_id}
							>
								{!isBusinessParticipant(participant) && canManage && (
									<SimpleTooltip
										title={t('Remove from group')}
										disableHoverableContent
									>
										<Button
											variant="ghost"
											color="neutral"
											size="none"
											className={cn(rowIconButtonClassName, 'text-ink/45')}
											aria-label={t('Remove from group')}
											onClick={() =>
												setConfirmation({ type: 'remove', participant })
											}
										>
											<PersonRemoveIcon />
										</Button>
									</SimpleTooltip>
								)}
							</PersonRow>
						))}
					</Section>
				)}

				{isActive && group.join_approval_mode === 'approval_required' && (
					<Section>
						<div className={sectionTitleClassName}>
							<span>{t('Join requests')}</span>
							{joinRequests.length > 0 && (
								<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-semibold text-white tabular-nums">
									{joinRequests.length}
								</span>
							)}
						</div>

						{joinRequests.length === 0 && (
							<div className="pb-2 text-[13px] text-ink/50">
								{t('No pending join requests')}
							</div>
						)}

						{joinRequests.map((request) => (
							<PersonRow
								key={request.join_request_id}
								name={getGroupParticipantName(request)}
								waId={request.wa_id}
								detail={
									<Moment unix fromNow>
										{request.creation_timestamp}
									</Moment>
								}
							>
								{renderJoinRequestButtons(request)}
							</PersonRow>
						))}

						{joinRequests.length > 1 && canManage && (
							<div className="flex gap-2 pt-2 pb-1">
								<Button
									variant="outline"
									color="neutral"
									size="xs"
									className="flex-1"
									disabled={busyJoinRequests.length > 0}
									onClick={() =>
										handleJoinRequests(
											joinRequests.map((item) => item.join_request_id),
											'reject'
										)
									}
								>
									{t('Reject all')}
								</Button>
								<SimpleTooltip
									title={
										canApproveJoinRequests(group, joinRequests.length)
											? undefined
											: t('Not enough room in the group for all of them')
									}
									disableHoverableContent
								>
									<span className="flex flex-1">
										<Button
											size="xs"
											className="flex-1"
											disabled={
												busyJoinRequests.length > 0 ||
												!canApproveJoinRequests(group, joinRequests.length)
											}
											onClick={() =>
												handleJoinRequests(
													joinRequests.map((item) => item.join_request_id),
													'approve'
												)
											}
											data-test-id="approve-all"
										>
											{t('Approve all')}
										</Button>
									</span>
								</SimpleTooltip>
							</div>
						)}
					</Section>
				)}

				{isActive && group.invite_link && (
					<Section>
						<div className={sectionTitleClassName}>{t('Invite link')}</div>
						<div className="flex items-center gap-2 rounded-[10px] bg-ink/[0.04] px-3 py-2 [&_.app-icon]:size-4! [&_.app-icon]:text-ink/45!">
							<LinkIcon />
							<span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-ink/80">
								{group.invite_link}
							</span>
						</div>
						<p className="mt-1.5 mb-2.5 text-[12px] text-ink/50">
							{group.join_approval_mode === 'approval_required'
								? t('People who open this link send a join request.')
								: t('People who open this link join the group right away.')}
						</p>
						<div className="flex gap-2 pb-1.5">
							<Button
								variant="outline"
								color="neutral"
								size="sm"
								className="flex-1 [&_.app-icon]:size-4! [&_.app-icon]:text-current!"
								onClick={copyInviteLink}
							>
								<ContentCopyIcon />
								{t('Copy link')}
							</Button>
							{canManage && (
								<Button
									variant="outline"
									color="destructive"
									size="sm"
									className="flex-1 [&_.app-icon]:size-4! [&_.app-icon]:text-current!"
									onClick={() => setConfirmation({ type: 'reset_link' })}
								>
									<SettingsBackupRestoreIcon />
									{t('Reset link')}
								</Button>
							)}
						</div>
					</Section>
				)}

				{canChange &&
					group.status !== 'deleted' &&
					group.status !== 'creating' && (
						<Section>
							<Button
								variant="ghost"
								color="destructive"
								size="sm"
								className="my-1 w-full justify-start [&_.app-icon]:size-4.5! [&_.app-icon]:text-current!"
								onClick={() => setConfirmation({ type: 'delete' })}
							>
								<DeleteIcon />
								{t('Delete group')}
							</Button>
						</Section>
					)}
			</div>

			<ConfirmDialog
				open={confirmation !== undefined}
				title={
					confirmation?.type === 'remove'
						? t('Remove participant?')
						: confirmation?.type === 'reset_link'
						? t('Reset invite link?')
						: t('Delete group?')
				}
				description={
					confirmation?.type === 'remove'
						? t(
								'%s will be removed from the group and cannot rejoin with the invite link.',
								getGroupParticipantName(confirmation.participant)
						  )
						: confirmation?.type === 'reset_link'
						? t(
								'The current link stops working. Anyone you sent it to will need the new one.'
						  )
						: t(
								'All participants are removed and the group is deleted on WhatsApp. Its chat stays readable here.'
						  )
				}
				confirmLabel={
					confirmation?.type === 'remove'
						? t('Remove')
						: confirmation?.type === 'reset_link'
						? t('Reset link')
						: t('Delete group')
				}
				isDestructive
				onConfirm={confirmAction}
				onClose={() => setConfirmation(undefined)}
			/>

			{isAddParticipantsOpen && (
				<AddParticipantsDialog
					group={group}
					onClose={() => setAddParticipantsOpen(false)}
				/>
			)}
		</SidePanel>
	);
};

export default GroupInfo;
