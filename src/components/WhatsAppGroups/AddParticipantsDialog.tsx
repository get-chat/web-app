import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@src/components/ui/select';
import { Checkbox } from '@src/components/ui/checkbox';
import { Spinner } from '@src/components/ui/spinner';
import CustomAvatar from '@src/components/CustomAvatar';
import SearchBar from '@src/components/SearchBar/SearchBar';
import PhoneNumberInput from '@src/components/PhoneNumberInput';
import SendIcon from '@src/components/icons/Send';
import SmsIcon from '@src/components/icons/Sms';
import CloseIcon from '@src/components/icons/Close';
import { cn } from '@src/lib/utils';
import useContacts from '@src/components/Contacts/useContacts';
import { useAppSelector } from '@src/store/hooks';
import { inviteToWhatsAppGroup } from '@src/api/whatsappGroupsApi';
import {
	InviteToWhatsAppGroupResponse,
	WhatsAppGroupDetail,
} from '@src/types/whatsappGroups';
import { Template } from '@src/types/templates';
import {
	generateTemplateKey,
	getTemplateLanguageCode,
	isTemplateApproved,
} from '@src/helpers/TemplateMessageHelper';
import {
	addPlus,
	getCountryFromWaId,
	isPhoneNumber,
	prepareWaId,
} from '@src/helpers/PhoneNumberHelper';
import {
	getRemainingParticipantSlots,
	getWhatsAppGroupErrorMessage,
	getWhatsAppGroupMaxParticipants,
	getWhatsAppGroupParticipantCount,
} from '@src/helpers/WhatsAppGroupHelper';

interface Props {
	group: WhatsAppGroupDetail;
	onClose: () => void;
	onInvited?: () => void;
}

interface Invitee {
	waId: string;
	name?: string;
}

/**
 * A template made from Meta's "Group invite link" library template: the only
 * kind the invite can send, as its body takes nothing but the group id.
 */
export const isGroupInviteTemplate = (template: Template) =>
	[template.library_template_name, template.name].some((name) =>
		name?.toLowerCase().includes('group_invite')
	);

/** The invite template to offer first, if there is any */
export const pickDefaultInviteTemplate = (templates: Template[]) =>
	templates.find(isGroupInviteTemplate);

/**
 * Invites people to a WhatsApp group: WhatsApp has no "add participant", so
 * each picked contact or typed number gets the invite template 1:1, and
 * joins by tapping its link. Never more than the places left.
 */
const AddParticipantsDialog: React.FC<Props> = ({
	group,
	onClose,
	onInvited,
}) => {
	const { t } = useTranslation();

	const templates = useAppSelector((state) => state.templates.value);
	const businessNumber = useAppSelector((state) => state.phoneNumber.value);
	const { keyword, setKeyword, isLoading, unifiedList } = useContacts();

	// Approved group invite templates: any other would be refused
	const approvedTemplates = useMemo(
		() =>
			Object.values(templates).filter(
				(item) => isTemplateApproved(item) && isGroupInviteTemplate(item)
			),
		[templates]
	);
	const [templateKey, setTemplateKey] = useState(() => {
		const template = pickDefaultInviteTemplate(approvedTemplates);
		return template ? generateTemplateKey(template) : '';
	});
	const template = templates[templateKey];

	// Templates still loading when the dialog opened: preselect once they come
	useEffect(() => {
		if (!templateKey) {
			const defaultTemplate = pickDefaultInviteTemplate(approvedTemplates);
			if (defaultTemplate) setTemplateKey(generateTemplateKey(defaultTemplate));
		}
	}, [approvedTemplates]);

	const [selected, setSelected] = useState<Invitee[]>([]);
	const [typedNumber, setTypedNumber] = useState({ value: '', isValid: false });
	const [phoneInputKey, setPhoneInputKey] = useState(0);
	const [isSending, setSending] = useState(false);
	const [failures, setFailures] = useState<
		InviteToWhatsAppGroupResponse['failed']
	>([]);

	const participantCount = getWhatsAppGroupParticipantCount(group);
	const maxParticipants = getWhatsAppGroupMaxParticipants(group);
	const remaining = getRemainingParticipantSlots(group) ?? maxParticipants;
	const isLimitReached = selected.length >= remaining;
	const placesLeft = Math.max(0, remaining - selected.length);

	// One row per phone number of the people and contacts found
	const candidates = useMemo(() => {
		const seen = new Set<string>();
		const result: Invitee[] = [];
		unifiedList.forEach((recipient) => {
			recipient.phone_numbers?.forEach(({ phone_number }) => {
				const waId = prepareWaId(phone_number);
				if (!waId || !isPhoneNumber(waId) || seen.has(waId)) return;
				seen.add(waId);
				result.push({ waId, name: recipient.name });
			});
		});
		return result;
	}, [unifiedList]);

	const isSelected = (waId: string) =>
		selected.some((invitee) => invitee.waId === waId);

	const toggle = (invitee: Invitee) => {
		setFailures([]);
		setSelected((prev) =>
			prev.some((item) => item.waId === invitee.waId)
				? prev.filter((item) => item.waId !== invitee.waId)
				: prev.length < remaining
				? [...prev, invitee]
				: prev
		);
	};

	const addTypedNumber = () => {
		const waId = prepareWaId(typedNumber.value);
		if (!waId || !typedNumber.isValid || isLimitReached) return;
		if (!isSelected(waId)) toggle({ waId });
		setPhoneInputKey((key) => key + 1);
		setTypedNumber({ value: '', isValid: false });
	};

	const send = async () => {
		if (!template || selected.length === 0) return;
		setSending(true);
		try {
			const result = await inviteToWhatsAppGroup(group.id, {
				wa_ids: selected.map((invitee) => invitee.waId),
				template_name: template.name,
				language: getTemplateLanguageCode(template.language) ?? '',
			});
			const sent = result.sent ?? [];
			const failed = result.failed ?? [];
			if (sent.length > 0) {
				window.displaySuccess(
					t('Invite sent to %d contact', {
						count: sent.length,
						postProcess: 'sprintf',
						sprintf: [sent.length],
					})
				);
				onInvited?.();
			}
			if (failed.length > 0) {
				// Keep the ones that failed, to retry or drop
				setFailures(failed);
				setSelected((prev) =>
					prev.filter((invitee) =>
						failed.some((item) => item.wa_id === invitee.waId)
					)
				);
			} else {
				onClose();
			}
		} catch (error) {
			window.displayCustomError(
				getWhatsAppGroupErrorMessage(error, t('The invites could not be sent.'))
			);
		} finally {
			setSending(false);
		}
	};

	const bodyText = template?.components?.find(
		(component) => component.type === 'BODY'
	)?.text;
	const buttons =
		template?.components?.find(
			(component) => component.type === 'BUTTONS' || component.type === 'BUTTON'
		)?.buttons ?? [];

	const nameOf = (waId: string) =>
		selected.find((invitee) => invitee.waId === waId)?.name ?? addPlus(waId);

	return (
		<Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent size="md" showCloseButton className="sm:max-w-[760px]">
				<DialogHeader>
					<DialogTitle>{t('Add participants')}</DialogTitle>
					<p className="m-0 text-[13px] text-ink/55">
						{participantCount !== undefined &&
							`${participantCount}/${maxParticipants} · `}
						{t('%d place left', {
							count: placesLeft,
							postProcess: 'sprintf',
							sprintf: [placesLeft],
						})}
					</p>
				</DialogHeader>

				<DialogBody className="flex gap-5 pb-3 max-md:flex-col">
					{/* Who to invite */}
					<div className="flex min-w-0 flex-1 flex-col gap-2.5">
						<div className="flex items-start gap-2">
							<div className="min-w-0 flex-1">
								<PhoneNumberInput
									key={phoneInputKey}
									defaultCountry={getCountryFromWaId(businessNumber)}
									onChange={(value, isValid) =>
										setTypedNumber({ value, isValid })
									}
									onEnter={addTypedNumber}
								/>
							</div>
							<Button
								variant="outline"
								className="mt-auto"
								disabled={!typedNumber.isValid || isLimitReached}
								onClick={addTypedNumber}
							>
								{t('Add')}
							</Button>
						</div>

						{selected.length > 0 && (
							<div className="flex flex-wrap gap-1.5">
								{selected.map((invitee) => (
									<span
										key={invitee.waId}
										className="inline-flex h-7 max-w-full items-center gap-1 rounded-full bg-primary/12 pr-1 pl-2.5 text-[12.5px] font-medium text-primary-deep"
									>
										<span className="truncate">
											{invitee.name ?? addPlus(invitee.waId)}
										</span>
										<Button
											variant="unstyled"
											size="none"
											className="size-5 rounded-full hover:bg-primary-deep/10 [&_.app-icon]:size-3! [&_.app-icon]:text-current!"
											aria-label={t('Remove')}
											onClick={() => toggle(invitee)}
										>
											<CloseIcon />
										</Button>
									</span>
								))}
							</div>
						)}

						<div className="flex min-h-0 flex-col overflow-hidden rounded-[12px] border border-ink/10">
							<SearchBar
								value={keyword}
								onChange={setKeyword}
								isLoading={isLoading}
								placeholder={t('Search contacts')}
							/>
							<div className="h-[260px] overflow-y-auto max-md:h-[200px]">
								{isLoading && candidates.length === 0 && (
									<div className="flex justify-center py-6 text-primary">
										<Spinner size={22} />
									</div>
								)}
								{!isLoading && candidates.length === 0 && (
									<div className="px-3.5 py-4 text-[13px] text-ink/50">
										{t('No contacts found')}
									</div>
								)}
								{candidates.map((invitee) => {
									const checked = isSelected(invitee.waId);
									const disabled = !checked && isLimitReached;
									return (
										<label
											key={invitee.waId}
											className={cn(
												'flex cursor-pointer items-center gap-3 px-3.5 py-2 transition-colors duration-150 hover:bg-ink/4',
												disabled && 'cursor-not-allowed opacity-50'
											)}
										>
											<Checkbox
												checked={checked}
												disabled={disabled}
												onCheckedChange={() => toggle(invitee)}
											/>
											<CustomAvatar
												className="size-8 text-[12px]"
												generateBgColorBy={invitee.name ?? invitee.waId}
											>
												{invitee.name
													?.split(' ')
													.map((part) => part[0])
													.join('')
													.slice(0, 2)
													.toUpperCase()}
											</CustomAvatar>
											<span className="flex min-w-0 flex-col">
												<span className="truncate text-[13.5px] font-medium">
													{invitee.name ?? addPlus(invitee.waId)}
												</span>
												<span className="text-[12px] text-ink/50 tabular-nums">
													{addPlus(invitee.waId)}
												</span>
											</span>
										</label>
									);
								})}
							</div>
						</div>
					</div>

					{/* What they receive */}
					<div className="flex w-[280px] shrink-0 flex-col gap-2.5 max-md:w-auto">
						<span className="text-[13px] font-semibold text-ink/80">
							{t('Invite template')}
						</span>
						{approvedTemplates.length === 0 ? (
							<div className="rounded-[12px] bg-warning-soft px-3.5 py-3 text-[13px] text-ink/75">
								{t(
									'There is no approved group invite template yet. Add the "Group invite link" template from the template library first.'
								)}
							</div>
						) : (
							<>
								<Select value={templateKey} onValueChange={setTemplateKey}>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{approvedTemplates.map((item) => (
											<SelectItem
												key={generateTemplateKey(item)}
												value={generateTemplateKey(item)}
											>
												{item.name} ({getTemplateLanguageCode(item.language)})
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								{template && (
									<div className="rounded-[14px] bg-chat-bg p-3">
										<div className="rounded-[12px] rounded-tl-[4px] bg-[#f4f0d7] px-3 py-2.5 text-[13px]/5 shadow-sm">
											<div className="mb-1 flex items-center gap-1 text-[11px] text-ink/50 [&_.app-icon]:size-3.5! [&_.app-icon]:text-ink/40!">
												<SmsIcon />
												{template.name}
											</div>
											<div className="whitespace-pre-wrap [word-break:break-word]">
												{bodyText}
											</div>
											{buttons.map((button: any, index: number) => (
												<div
													key={index}
													className="mt-2 border-t border-ink/8 pt-2 text-center text-[13px] font-medium text-primary"
												>
													{button.text}
												</div>
											))}
										</div>
									</div>
								)}
							</>
						)}
						<p className="m-0 text-[12px] text-ink/50">
							{t(
								'Sent as a 1:1 template to each contact. They join the group once they tap its link.'
							)}
						</p>
					</div>
				</DialogBody>

				{failures.length > 0 && (
					<div
						className="mx-5 mb-1 rounded-[10px] bg-destructive/8 px-3.5 py-2.5 text-[13px] text-destructive max-md:mx-[15px]"
						role="alert"
					>
						<div className="mb-1 font-semibold">
							{t('These invites could not be sent:')}
						</div>
						<ul className="m-0 flex flex-col gap-0.5 p-0 pl-4">
							{failures.map((failure) => (
								<li key={failure.wa_id}>
									<span className="font-medium">{nameOf(failure.wa_id)}</span>
									{': '}
									{failure.error}
								</li>
							))}
						</ul>
					</div>
				)}

				<DialogFooter className="border-t border-ink/10 px-5 py-3 max-md:px-[15px]">
					<Button variant="outline" color="neutral" onClick={onClose}>
						{t('Cancel')}
					</Button>
					<Button
						className="[&_.app-icon]:size-4! [&_.app-icon]:text-current!"
						disabled={!template || selected.length === 0 || remaining === 0}
						loading={isSending}
						onClick={send}
						data-test-id="send-group-invite"
					>
						{!isSending && <SendIcon />}
						{t('Send invite')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default AddParticipantsDialog;
