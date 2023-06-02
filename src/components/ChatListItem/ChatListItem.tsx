import React, { MouseEvent, TouchEvent } from 'react';
import { Checkbox, ListItemButton, Tooltip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import Moment from 'react-moment';
import { extractAvatarFromContactProviderData } from '@src/helpers/Helpers';
import { handleDragOver } from '@src/helpers/FileHelper';
import { CALENDAR_SHORT } from '@src/Constants';
import ChatMessageShortContent from '../Main/Chat/ChatMessage/ChatMessageShortContent';
import { addPlus } from '@src/helpers/PhoneNumberHelper';
import { useTranslation } from 'react-i18next';
import PrintMessage from '../PrintMessage';
import CustomAvatar from '@src/components/CustomAvatar';
import SellIcon from '@mui/icons-material/Sell';
import useChatListItem from '@src/components/ChatListItem/useChatListItem';
import styles from './ChatListItem.module.css';
import classNames from 'classnames/bind';
import AssigneeChip from '@src/components/AssigneeChip';
import useChatAssignmentAPI from '@src/hooks/api/useChatAssignmentAPI';

const cx = classNames.bind(styles);

const ChatListItem = (props: any) => {
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

	const newMessages = props.newMessages[data.waId]?.newMessages;

	const preventEvents = (event: MouseEvent | TouchEvent) => {
		event.stopPropagation();
		event.preventDefault();
	};

	return (
		<ListItemButton onClick={handleClick} className={styles.listItem}>
			<div
				id={data.waId}
				className={cx({
					wrapper: true,
					active: waId === data.waId,
					expired: isExpired,
					almostExpired: remainingSeconds < 8 * 60 * 60,
					selected: props.isSelectionModeEnabled && isSelected,
				})}
				onDrop={handleDroppedFiles}
				onDragOver={handleDragOver}
			>
				<div className={styles.item}>
					{props.isSelectionModeEnabled && (
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
								props.contactProvidersData[data.waId]
							)}
							generateBgColorBy={!isExpired ? data.name : undefined}
						>
							{data.initials}
						</CustomAvatar>

						{newMessages > 0 && (
							<div className={styles.newMessagesBadge}>
								{newMessages > 99 ? '99+' : newMessages}
							</div>
						)}
					</div>

					<div className={styles.info}>
						<div className={styles.nameWrapper}>
							<h2>
								{props.keyword && props.keyword.trim().length > 0 ? (
									<PrintMessage
										message={data.name}
										highlightText={props.keyword}
									/>
								) : (
									<PrintMessage
										message={
											props.contactProvidersData[data.waId]?.[0]?.name ??
											data.name
										}
									/>
								)}
							</h2>

							{!isExpired && (
								<Tooltip
									title={t('This chat will expire in %s', timeLeft)}
									placement="top"
								>
									<div className={styles.timeLeft}>
										<div className={styles.timeLeftIconWrapper}>
											<HourglassBottomIcon />
										</div>
										<span>{timeLeft}</span>
									</div>
								</Tooltip>
							)}

							{isUserAssignmentChipVisible() && (
								<Tooltip
									placement="top"
									title={data.generateAssignmentInformation()}
									PopperProps={{ style: { zIndex: 1 } }}
								>
									<div
										className={cx({
											assigneeChipWrapper: true,
											empty: !data.assignedToUser,
										})}
										onClick={preventEvents}
										onMouseDown={preventEvents}
										onMouseUp={preventEvents}
										onTouchStart={preventEvents}
									>
										<AssigneeChip
											assigneeType={'user'}
											name={data.assignedToUser?.username}
											assignedUserId={data.assignedToUser?.id}
											assignedGroupId={data.assignedGroup?.id}
											dense
											isActionable
											onAction={(userId, groupId) => {
												partialUpdateChatAssignment(data.waId, userId, groupId);
											}}
										/>
									</div>
								</Tooltip>
							)}

							{isGroupAssignmentChipVisible() && (
								<Tooltip
									placement="top"
									title={data.generateAssignmentInformation()}
									PopperProps={{ style: { zIndex: 1 } }}
								>
									<div
										className={cx({
											assigneeChipWrapper: true,
											empty: !data.assignedGroup,
										})}
										onClick={preventEvents}
										onMouseDown={preventEvents}
										onMouseUp={preventEvents}
									>
										<AssigneeChip
											assigneeType={'group'}
											name={data.assignedGroup?.name}
											assignedUserId={data.assignedToUser?.id}
											assignedGroupId={data.assignedGroup?.id}
											dense
											isActionable
											onAction={(userId, groupId) => {
												partialUpdateChatAssignment(data.waId, userId, groupId);
											}}
										/>
									</div>
								</Tooltip>
							)}
						</div>

						<div className={styles.lastMessageWrapper}>
							<div className={styles.lastMessage}>
								<ChatMessageShortContent
									type={data.lastMessageType}
									template={data.lastMessage?.template}
									buttonText={data.lastMessageButtonText}
									interactiveButtonText={data.interactiveButtonText}
									text={data.lastMessageBody}
									caption={data.lastMessageCaption}
									isLastMessageFromUs={data.isLastMessageFromUs}
								/>
							</div>

							<div className={styles.dateTagWrapper}>
								{data.tags?.length > 0 && (
									<div className={styles.tags}>
										<Tooltip title={generateTagNames()}>
											<div>
												{data.tags
													.slice(0, 3)
													.map((tagItem: any, tagIndex: Number) => (
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

								{data.lastMessageTimestamp && (
									<Moment
										className={styles.lastMessageDate}
										date={data.lastMessageTimestamp}
										calendar={CALENDAR_SHORT}
										unix
									/>
								)}
							</div>
						</div>
					</div>
				</div>

				<span className={styles.waId}>{addPlus(data.waId)}</span>

				{hasFailedMessages() && (
					<div className={styles.failedMessagesIndicator}>
						<Tooltip title={t('This chat has failed messages!')}>
							<WarningIcon className="error" />
						</Tooltip>
					</div>
				)}
			</div>
		</ListItemButton>
	);
};

export default ChatListItem;
