import React, { KeyboardEvent, MouseEvent, TouchEvent, useMemo } from 'react';
import HourglassBottomIcon from '@src/components/icons/HourglassBottom';
import { extractAvatarFromContactProviderData } from '@src/helpers/Helpers';
import { handleDragOver } from '@src/helpers/FileHelper';
import { CALENDAR_SHORT } from '@src/Constants';
import ChatMessageShortContent from '../Main/Chat/ChatMessage/ChatMessageShortContent';
import { addPlus } from '@src/helpers/PhoneNumberHelper';
import { useIsUserActionsRestricted } from '@src/hooks/useIsUserActionsRestricted';
import { Trans, useTranslation } from 'react-i18next';
import PrintMessage from '../PrintMessage';
import CustomAvatar from '@src/components/CustomAvatar';
import useChatListItem from '@src/components/ChatListItem/useChatListItem';
import AssigneeChip from '@src/components/AssigneeChip';
import useChatAssignmentAPI from '@src/hooks/api/useChatAssignmentAPI';
import { useAppSelector } from '@src/store/hooks';
import {
	getChatContactName,
	getLastMessageTimestamp,
	isLastMessageOutgoing,
} from '@src/helpers/ChatHelper';
import { getMessageCaption } from '@src/helpers/MessageHelper';
import { MessageType } from '@src/types/messages';
import DoneIcon from '@src/components/icons/Check';
import { SimpleTooltip } from '@src/components/ui/tooltip';
import { Checkbox } from '@src/components/ui/checkbox';
import SellIcon from '@src/components/icons/Sell';
import WarningIcon from '@src/components/icons/Warning';
import Moment from 'react-moment';
import { cn } from '@src/lib/utils';

// The contact name, cut to one line
const nameClassName = 'line-clamp-1 text-ellipsis break-all';

// The last message, cut to one line, with its dimmed type and reply icons.
// The reply arrow keeps the smaller size App.css gives .replyIcon.
const lastMessageClassName = cn(
	'mr-1.25 line-clamp-1 text-ellipsis break-all',
	'[&_.app-icon]:mr-1.25 [&_.app-icon]:-ml-0.5 [&_.app-icon]:text-ink/30! [&_.app-icon:not(.replyIcon)]:size-[0.8em]!',
	'[&_.chatMessageTypeLabel]:font-semibold [&_.emoji-mart-emoji]:size-4.5!'
);

// An unassigned chip shows only while its row is hovered or its menu is open
const emptyChipClassName =
	'opacity-0 transition-opacity duration-100 ease-in group-hover/chat:opacity-100 data-menu-open:opacity-100';

const ChatListItem = (props: any) => {
	const { isReadOnly, isSelectionModeEnabled } = useAppSelector(
		(state) => state.UI
	);

	const isUserActionsRestricted = useIsUserActionsRestricted();

	const newMessages = useAppSelector((state) => state.newMessages.value);

	const { t } = useTranslation();

	const {
		data,
		waId,
		isExpired,
		timeLeft,
		remainingSeconds,
		isUserAssignmentChipVisible,
		isGroupAssignmentChipVisible,
		isSelected,
		handleClick,
		handleDroppedFiles,
		generateTagNames,
		isDisabled,
		hasFailedMessages,
	} = useChatListItem({ props });

	const { partialUpdateChatAssignment } = useChatAssignmentAPI();

	const newMessagesForChat = newMessages[data.wa_id]?.newMessages;

	const preventEvents = (event: MouseEvent | TouchEvent) => {
		event.stopPropagation();
		event.preventDefault();
	};

	// Keyboard activation of the row, as MUI's ListItemButton did. Only for
	// keys pressed on the row itself, not on the controls inside it.
	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.target !== event.currentTarget) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick();
		}
	};

	const tooltip = useMemo(() => {
		if (!data.assigned_to_user && !data.assigned_group) return;

		return (
			<>
				{data.assigned_to_user && (
					<div>
						<Trans
							values={{
								postProcess: 'sprintf',
								sprintf: [data.assigned_to_user.username],
							}}
						>
							Assigned to: <span className="bold">%s</span>
						</Trans>
					</div>
				)}
				{data.assigned_group && (
					<div>
						<Trans
							values={{
								postProcess: 'sprintf',
								sprintf: [data.assigned_group.name],
							}}
						>
							Assigned group: <span className="bold">%s</span>
						</Trans>
					</div>
				)}
			</>
		);
	}, [data.assigned_to_user, data.assigned_group]);

	const isActive = waId === data.wa_id;
	const isSelectedRow = isSelectionModeEnabled && isSelected;

	const assigneeChipProps = {
		tooltip,
		assignedUserId: data.assigned_to_user?.id,
		assignedGroupId: data.assigned_group?.id,
		dense: true,
		isActionable: !isReadOnly,
		onAction: (userId?: number | null, groupId?: number | null) => {
			partialUpdateChatAssignment(data.wa_id, userId, groupId);
		},
	};

	return (
		<div
			role="button"
			tabIndex={0}
			className="group/chat relative flex w-full cursor-pointer items-center p-0 text-left outline-none! select-none"
			onClick={handleClick}
			onKeyDown={handleKeyDown}
		>
			<div
				id={data.wa_id}
				className={cn(
					'relative flex flex-1 cursor-pointer flex-col transition-[background-color] duration-150 ease-out',
					isSelectedRow
						? 'bg-[#d9efec]'
						: cn(
								'bg-white hover:bg-gray-lighter group-focus-visible/chat:bg-gray-lighter',
								isActive && 'bg-gray-lighter'
						  )
				)}
				onDrop={handleDroppedFiles}
				onDragOver={handleDragOver}
			>
				<div className="relative flex flex-1 items-center px-3.75 py-2.5">
					{isSelectionModeEnabled && (
						// Takes the room of MUI's 42px checkbox (and its margins)
						// around an 18px box
						<Checkbox
							className="mr-4.25 ml-0.5"
							checked={isSelected}
							color="primary"
							disabled={isDisabled}
						/>
					)}

					<div className="relative">
						<CustomAvatar
							className="size-12.5 self-center"
							src={extractAvatarFromContactProviderData(
								props.contactProvidersData[data.wa_id]
							)}
							generateBgColorBy={
								!isExpired ? getChatContactName(data) : undefined
							}
						>
							{/* Same initials source as ChatHeader and the other avatar
						render sites, so the same contact gets the same avatar */}
							{data.contact.initials}
						</CustomAvatar>

						{newMessagesForChat > 0 && (
							<div className="absolute -bottom-0.75 left-8.25 flex min-w-4.5 items-center justify-center rounded-[10px] border border-[red] bg-[red] px-1.25 py-px text-[10px] font-semibold text-white">
								{newMessagesForChat > 99 ? '99+' : newMessagesForChat}
							</div>
						)}
					</div>

					<div className="ml-3.75 flex-1">
						<div className="flex items-center justify-between gap-1.25">
							<h2 className="flex-1 text-[14px] font-semibold [&_.emoji-mart-emoji]:size-3.5!">
								{props.keyword && props.keyword.trim().length > 0 ? (
									<PrintMessage
										className={nameClassName}
										message={getChatContactName(data) ?? ''}
										highlightText={props.keyword}
									/>
								) : (
									<span className={nameClassName}>
										{props.contactProvidersData[data.wa_id]?.[0]?.name ??
											getChatContactName(data)}
									</span>
								)}
							</h2>

							{isUserAssignmentChipVisible() && (
								<div
									onClick={preventEvents}
									onMouseDown={preventEvents}
									onMouseUp={preventEvents}
									onTouchStart={preventEvents}
								>
									<AssigneeChip
										{...assigneeChipProps}
										className={cn(!data.assigned_to_user && emptyChipClassName)}
										assigneeType="user"
										name={data.assigned_to_user?.username}
									/>
								</div>
							)}

							{isGroupAssignmentChipVisible() && (
								<div
									onClick={preventEvents}
									onMouseDown={preventEvents}
									onMouseUp={preventEvents}
								>
									<AssigneeChip
										{...assigneeChipProps}
										className={cn(!data.assigned_group && emptyChipClassName)}
										assigneeType="group"
										name={data.assigned_group?.name}
									/>
								</div>
							)}

							{!isExpired && timeLeft && (
								<SimpleTooltip
									title={t('This chat will expire in %s', timeLeft)}
									side="top"
									disableHoverableContent
								>
									<div className="flex h-4.75 items-center justify-center rounded-[10px] bg-primary pr-1.25 text-[12px] font-semibold text-white transition-[background-color] duration-800 ease-in">
										<div className="mr-0.75 flex size-4.75 items-center justify-center rounded-[15px] bg-black/20 [&_.app-icon]:size-[11px]! [&_.app-icon]:text-white!">
											<HourglassBottomIcon />
										</div>
										<span>{timeLeft}</span>
									</div>
								</SimpleTooltip>
							)}

							{data.contact.resolved && (
								<SimpleTooltip
									title={t('Resolved')}
									side="top"
									disableHoverableContent
								>
									<div className="flex size-4.75 items-center justify-center rounded-[15px] bg-success [&_.app-icon]:size-[13px]! [&_.app-icon]:text-white!">
										<DoneIcon />
									</div>
								</SimpleTooltip>
							)}
						</div>

						<div className="flex items-baseline justify-between text-[14px] text-ink/70">
							<div className="flex-1">
								<ChatMessageShortContent
									className={lastMessageClassName}
									type={
										data.last_message?.waba_payload?.type ?? MessageType.none
									}
									template={data.last_message?.waba_payload?.template}
									buttonText={data.last_message?.waba_payload?.button?.text}
									interactiveButtonText={
										data.last_message?.waba_payload?.interactive?.button_reply
											?.title
									}
									text={data.last_message?.waba_payload?.text?.body}
									caption={getMessageCaption(data.last_message)}
									isLastMessageFromUs={isLastMessageOutgoing(data)}
									reaction={data.last_message?.waba_payload?.reaction}
								/>
							</div>

							<div className="flex items-baseline">
								{data.tags?.length > 0 && (
									<div className="mr-1.25 ml-1.75 flex w-max">
										<SimpleTooltip
											title={generateTagNames()}
											disableHoverableContent
										>
											<div>
												{data.tags.slice(0, 3).map((tagItem, tagIndex) => (
													<SellIcon
														className="-ml-1.75 size-[0.7em]!"
														key={tagIndex.toString()}
														style={{
															fill: tagItem.web_inbox_color,
														}}
													/>
												))}
											</div>
										</SimpleTooltip>
									</div>
								)}

								{Boolean(getLastMessageTimestamp(data)) && (
									<Moment
										className="text-[10px] font-normal text-ink/60"
										date={getLastMessageTimestamp(data)}
										calendar={CALENDAR_SHORT}
										unix
									/>
								)}
							</div>
						</div>
					</div>
				</div>

				{!isUserActionsRestricted && (
					// Shown while the row is hovered, except on narrow screens
					<span className="absolute right-3.75 bottom-px ml-1.25 text-[10px] text-ink/65 opacity-0 transition-opacity duration-100 ease-[ease] group-hover/chat:opacity-100 max-md:group-hover/chat:hidden">
						{addPlus(data.wa_id)}
					</span>
				)}

				{hasFailedMessages() && (
					<div className="absolute top-0.75 left-2 [&_.app-icon]:size-5.5! [&_.app-icon]:text-[red]!">
						<SimpleTooltip
							title={t('This chat has failed messages!')}
							disableHoverableContent
						>
							<WarningIcon />
						</SimpleTooltip>
					</div>
				)}
			</div>
		</div>
	);
};

export default ChatListItem;
