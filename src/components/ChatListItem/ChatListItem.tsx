import React, { MouseEvent, TouchEvent, useMemo } from 'react';
import { Checkbox, ListItemButton, Tooltip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import Moment from 'react-moment';
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
import SellIcon from '@mui/icons-material/Sell';
import useChatListItem from '@src/components/ChatListItem/useChatListItem';
import styles from './ChatListItem.module.css';
import classNames from 'classnames/bind';
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

const cx = classNames.bind(styles);

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
		<ListItemButton onClick={handleClick} className={styles.listItem}>
			<div
				id={data.wa_id}
				className={cx({
					wrapper: true,
					active: waId === data.wa_id,
					expired: isExpired,
					almostExpired: remainingSeconds < 8 * 60 * 60,
					selected: isSelectionModeEnabled && isSelected,
				})}
				onDrop={handleDroppedFiles}
				onDragOver={handleDragOver}
			>
				<div className={styles.item}>
					{isSelectionModeEnabled && (
						<Checkbox
							className={styles.selection}
							checked={isSelected}
							color="primary"
							disabled={isDisabled}
						/>
					)}

					<div className={styles.avatarWrapper}>
						<CustomAvatar
							className={styles.mainAvatar}
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
							<div className={styles.newMessagesBadge}>
								{newMessagesForChat > 99 ? '99+' : newMessagesForChat}
							</div>
						)}
					</div>

					<div className={styles.info}>
						<div className={styles.nameWrapper}>
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
								<div
									className={cx({
										assigneeChipWrapper: true,
										empty: !data.assigned_to_user,
									})}
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
								</div>
							)}

							{isGroupAssignmentChipVisible() && (
								<div
									className={cx({
										assigneeChipWrapper: true,
										empty: !data.assigned_group,
									})}
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
								</div>
							)}

							{!isExpired && timeLeft && (
								<Tooltip
									title={t('This chat will expire in %s', timeLeft)}
									placement="top"
									disableInteractive
								>
									<div className={styles.timeLeft}>
										<div className={styles.timeLeftIconWrapper}>
											<HourglassBottomIcon />
										</div>
										<span>{timeLeft}</span>
									</div>
								</Tooltip>
							)}
						</div>

						<div className={styles.lastMessageWrapper}>
							<div className={styles.lastMessage}>
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
							</div>

							<div className={styles.dateTagWrapper}>
								{data.tags?.length > 0 && (
									<div className={styles.tags}>
										<Tooltip title={generateTagNames()} disableInteractive>
											<div>
												{data.tags.slice(0, 3).map((tagItem, tagIndex) => (
													<SellIcon
														key={tagIndex.toString()}
														className={styles.tagIcon}
														style={{
															fill: tagItem.web_inbox_color,
														}}
													/>
												))}
											</div>
										</Tooltip>
									</div>
								)}

								{Boolean(getLastMessageTimestamp(data)) && (
									<Moment
										className={styles.lastMessageDate}
										date={getLastMessageTimestamp(data)}
										calendar={CALENDAR_SHORT}
										unix
									/>
								)}
							</div>
						</div>
					</div>
				</div>

				<span className={styles.waId}>{addPlus(data.wa_id)}</span>

				{hasFailedMessages() && (
					<div className={styles.failedMessagesIndicator}>
						<Tooltip
							title={t('This chat has failed messages!')}
							disableInteractive
						>
							<WarningIcon className="error" />
						</Tooltip>
					</div>
				)}
			</div>
		</ListItemButton>
	);
};

export default ChatListItem;
