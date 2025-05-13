import React, { MouseEvent, TouchEvent, useMemo } from 'react';
import { Tooltip } from '@mui/material';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import {
	extractAvatarFromContactProviderData,
	generateInitialsHelper,
} from '@src/helpers/Helpers';
import { handleDragOver } from '@src/helpers/FileHelper';
import { CALENDAR_SHORT } from '@src/Constants';
import ChatMessageShortContent from '../Main/Chat/ChatMessage/ChatMessageShortContent';
import { addPlus } from '@src/helpers/PhoneNumberHelper';
import { Trans, useTranslation } from 'react-i18next';
import PrintMessage from '../PrintMessage';
import CustomAvatar from '@src/components/CustomAvatar';
import useChatListItem from '@src/components/ChatListItem/useChatListItem';
import * as Styled from './ChatListItem.styles';
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

const ChatListItem = (props: any) => {
	const { isReadOnly, isSelectionModeEnabled } = useAppSelector(
		(state) => state.UI
	);

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

	return (
		<Styled.ListItem onClick={handleClick}>
			<Styled.Wrapper
				id={data.wa_id}
				className={`
          ${waId === data.wa_id ? 'active' : ''}
          ${isExpired ? 'expired' : ''}
          ${remainingSeconds < 8 * 60 * 60 ? 'almostExpired' : ''}
          ${isSelectionModeEnabled && isSelected ? 'selected' : ''}
        `}
				onDrop={handleDroppedFiles}
				onDragOver={handleDragOver}
			>
				<Styled.Item className={isExpired ? 'expired' : ''}>
					{isSelectionModeEnabled && (
						<Styled.Selection
							checked={isSelected}
							color="primary"
							disabled={isDisabled}
						/>
					)}

					<Styled.AvatarWrapper>
						<CustomAvatar
							className="mainAvatar"
							src={extractAvatarFromContactProviderData(
								props.contactProvidersData[data.wa_id]
							)}
							generateBgColorBy={
								!isExpired ? getChatContactName(data) : undefined
							}
						>
							{generateInitialsHelper(getChatContactName(data))}
						</CustomAvatar>

						{newMessagesForChat > 0 && (
							<Styled.NewMessagesBadge>
								{newMessagesForChat > 99 ? '99+' : newMessagesForChat}
							</Styled.NewMessagesBadge>
						)}
					</Styled.AvatarWrapper>

					<Styled.Info>
						<Styled.NameWrapper>
							<h2>
								{props.keyword && props.keyword.trim().length > 0 ? (
									<PrintMessage
										message={getChatContactName(data) ?? ''}
										highlightText={props.keyword}
									/>
								) : (
									<span>
										{props.contactProvidersData[data.wa_id]?.[0]?.name ??
											getChatContactName(data)}
									</span>
								)}
							</h2>

							{isUserAssignmentChipVisible() && (
								<Styled.AssigneeChipWrapper
									className={!data.assigned_to_user ? 'empty' : ''}
									onClick={preventEvents}
									onMouseDown={preventEvents}
									onMouseUp={preventEvents}
									onTouchStart={preventEvents}
								>
									<AssigneeChip
										assigneeType={'user'}
										name={data.assigned_to_user?.username}
										tooltip={tooltip}
										assignedUserId={data.assigned_to_user?.id}
										assignedGroupId={data.assigned_group?.id}
										dense
										isActionable={!isReadOnly}
										onAction={(userId, groupId) => {
											partialUpdateChatAssignment(data.wa_id, userId, groupId);
										}}
									/>
								</Styled.AssigneeChipWrapper>
							)}

							{isGroupAssignmentChipVisible() && (
								<Styled.AssigneeChipWrapper
									className={!data.assigned_group ? 'empty' : ''}
									onClick={preventEvents}
									onMouseDown={preventEvents}
									onMouseUp={preventEvents}
								>
									<AssigneeChip
										assigneeType={'group'}
										name={data.assigned_group?.name}
										tooltip={tooltip}
										assignedUserId={data.assigned_to_user?.id}
										assignedGroupId={data.assigned_group?.id}
										dense
										isActionable={!isReadOnly}
										onAction={(userId, groupId) => {
											partialUpdateChatAssignment(data.wa_id, userId, groupId);
										}}
									/>
								</Styled.AssigneeChipWrapper>
							)}

							{!isExpired && timeLeft && (
								<Tooltip
									title={t('This chat will expire in %s', timeLeft)}
									placement="top"
									disableInteractive
								>
									<Styled.TimeLeft>
										<Styled.TimeLeftIconWrapper>
											<HourglassBottomIcon />
										</Styled.TimeLeftIconWrapper>
										<span>{timeLeft}</span>
									</Styled.TimeLeft>
								</Tooltip>
							)}
						</Styled.NameWrapper>

						<Styled.LastMessageWrapper>
							<Styled.LastMessage>
								<ChatMessageShortContent
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
							</Styled.LastMessage>

							<Styled.DateTagWrapper>
								{data.tags?.length > 0 && (
									<Styled.Tags>
										<Tooltip title={generateTagNames()} disableInteractive>
											<div>
												{data.tags.slice(0, 3).map((tagItem, tagIndex) => (
													<Styled.TagIcon
														key={tagIndex.toString()}
														style={{
															fill: tagItem.web_inbox_color,
														}}
													/>
												))}
											</div>
										</Tooltip>
									</Styled.Tags>
								)}

								{Boolean(getLastMessageTimestamp(data)) && (
									<Styled.LastMessageDate
										date={getLastMessageTimestamp(data)}
										calendar={CALENDAR_SHORT}
										unix
									/>
								)}
							</Styled.DateTagWrapper>
						</Styled.LastMessageWrapper>
					</Styled.Info>
				</Styled.Item>

				<Styled.WaId>{addPlus(data.wa_id)}</Styled.WaId>

				{hasFailedMessages() && (
					<Styled.FailedMessagesIndicator>
						<Tooltip
							title={t('This chat has failed messages!')}
							disableInteractive
						>
							<Styled.ErrorIcon />
						</Tooltip>
					</Styled.FailedMessagesIndicator>
				)}
			</Styled.Wrapper>
		</Styled.ListItem>
	);
};

export default ChatListItem;
