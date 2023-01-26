import React from 'react';
import '../../styles/SidebarChat.css';
import { Checkbox, ListItemButton, Tooltip } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import WarningIcon from '@mui/icons-material/Warning';
import Moment from 'react-moment';
import {
	extractAvatarFromContactProviderData,
	generateInitialsHelper,
} from '@src/helpers/Helpers';
import { handleDragOver } from '@src/helpers/FileHelper';
import {
	CALENDAR_SHORT,
	CHAT_LIST_TAB_CASE_ALL,
	CHAT_LIST_TAB_CASE_GROUP,
	CHAT_LIST_TAB_CASE_ME,
} from '@src/Constants';
import ChatMessageShortContent from '../Main/Chat/ChatMessage/ChatMessageShortContent';
import { generateAvatarColor } from '@src/helpers/AvatarHelper';
import { addPlus } from '@src/helpers/PhoneNumberHelper';
import { useTranslation } from 'react-i18next';
import PrintMessage from '../PrintMessage';
import CustomAvatar from '@src/components/CustomAvatar';
import SellIcon from '@mui/icons-material/Sell';
import useChatListItem from '@src/components/ChatListItem/useChatListItem';
import styles from './ChatListItem.module.css';

function ChatListItem(props) {
	const { t } = useTranslation();

	const {
		data,
		waId,
		isExpired,
		timeLeft,
		remainingSeconds,
		isSelected,
		handleClick,
		handleDroppedFiles,
		generateTagNames,
		isDisabled,
		hasFailedMessages,
	} = useChatListItem({ props });

	const newMessages = props.newMessages[data.waId]?.newMessages;

	return (
		<ListItemButton onClick={handleClick} className={styles.listItem}>
			<div
				id={data.waId}
				className={
					styles.wrapper +
					' ' +
					(waId === data.waId ? styles.active : '') +
					' ' +
					(isExpired
						? styles.expired
						: remainingSeconds < 8 * 60 * 60
						? styles.almostExpired
						: '') +
					' ' +
					(props.isSelectionModeEnabled && isSelected ? styles.selected : '')
				}
				onDrop={(event) => handleDroppedFiles(event)}
				onDragOver={(event) => handleDragOver(event)}
			>
				<div className={styles.item}>
					{props.isSelectionModeEnabled && (
						<Checkbox
							className={styles.selection}
							checked={isSelected}
							color="primary"
							disabled={isDisabled()}
						/>
					)}

					<div className={styles.avatarWrapper}>
						<CustomAvatar
							className={styles.mainAvatar}
							src={extractAvatarFromContactProviderData(
								props.contactProvidersData[data.waId]
							)}
							style={
								isExpired
									? {}
									: {
											backgroundColor: generateAvatarColor(data.name),
									  }
							}
						>
							{data.initials}
						</CustomAvatar>

						{newMessages > 0 && (
							<div className="sidebarChat__info__newMessagesBadge">
								{newMessages > 99 ? '99+' : newMessages}
							</div>
						)}
					</div>

					<div className="sidebarChat__info">
						<div className="sidebarChat__info__nameWrapper">
							<h2>
								{props.keyword !== undefined &&
								props.keyword.trim().length > 0 ? (
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

							{data.assignedToUser &&
								(props.tabCase === CHAT_LIST_TAB_CASE_ALL ||
									props.tabCase === CHAT_LIST_TAB_CASE_GROUP) && (
									<Tooltip
										placement="top"
										title={data.generateAssignmentInformation()}
									>
										<div className="sidebarChat__info__nameWrapper__assigneeChip">
											<CustomAvatar
												className="sidebarChat__info__nameWrapper__assignee"
												style={{
													backgroundColor: generateAvatarColor(
														data.getAssignedUserUsername()
													),
												}}
											>
												{generateInitialsHelper(
													data.generateAssignedToInitials()
												)}
											</CustomAvatar>
											<span>{data.getAssignedUserUsername()}</span>
										</div>
									</Tooltip>
								)}

							{data.assignedGroup &&
								((props.tabCase === CHAT_LIST_TAB_CASE_ALL &&
									!data.assignedToUser) ||
									props.tabCase === CHAT_LIST_TAB_CASE_ME ||
									(props.tabCase === CHAT_LIST_TAB_CASE_GROUP &&
										!data.assignedToUser)) && (
									<Tooltip
										placement="top"
										title={data.generateAssignmentInformation()}
									>
										<div className="sidebarChat__info__nameWrapper__assigneeChip">
											<CustomAvatar
												className="sidebarChat__info__nameWrapper__assignee"
												style={{
													backgroundColor: generateAvatarColor(
														data.assignedGroup?.name
													),
												}}
											>
												<GroupIcon />
											</CustomAvatar>
											<span>{data.assignedGroup?.name}</span>
										</div>
									</Tooltip>
								)}

							{!isExpired && (
								<div className="sidebarChat__info__timeLeft">
									<span>{t('%s left', timeLeft)}</span>
								</div>
							)}
						</div>

						<div className="sidebarChat__info__lastMessage">
							<div className="sidebarChat__info__lastMessage__body">
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

							<div>
								{data.tags?.length > 0 && (
									<div className="sidebarChat__info__tags">
										<Tooltip title={generateTagNames()}>
											<div>
												{data.tags.slice(0, 3).map((tagItem, tagIndex) => (
													<SellIcon
														key={tagIndex}
														className={data.tags.length > 1 ? 'multiple' : ''}
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
										className="sidebarChat__info__nameWrapper__lastMessageDate"
										date={data.lastMessageTimestamp}
										calendar={CALENDAR_SHORT}
										unix
									/>
								)}
							</div>
						</div>
					</div>
				</div>

				<span className="sidebarChatWrapper__waId">{addPlus(data.waId)}</span>

				{hasFailedMessages() && (
					<div className="sidebarChat__failedMessagesIndicator">
						<Tooltip title={t('This chat has failed messages!')}>
							<WarningIcon className="error" />
						</Tooltip>
					</div>
				)}
			</div>
		</ListItemButton>
	);
}

export default ChatListItem;
