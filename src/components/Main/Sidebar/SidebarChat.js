import React, { useEffect, useState } from 'react';
import '../../../styles/SidebarChat.css';
import { Checkbox, ListItem, Tooltip } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import GroupIcon from '@mui/icons-material/Group';
import WarningIcon from '@mui/icons-material/Warning';
import Moment from 'react-moment';
import moment from 'moment';
import {
	extractAvatarFromContactProviderData,
	generateInitialsHelper,
} from '@src/helpers/Helpers';
import { getDroppedFiles, handleDragOver } from '@src/helpers/FileHelper';
import PubSub from 'pubsub-js';
import {
	CALENDAR_SHORT,
	CHAT_LIST_TAB_CASE_ALL,
	CHAT_LIST_TAB_CASE_GROUP,
	CHAT_LIST_TAB_CASE_ME,
	EVENT_TOPIC_DROPPED_FILES,
} from '@src/Constants';
import ChatMessageShortContent from '../Chat/ChatMessage/ChatMessageShortContent';
import { generateAvatarColor } from '@src/helpers/AvatarHelper';
import { addPlus } from '@src/helpers/PhoneNumberHelper';
import { useTranslation } from 'react-i18next';
import PrintMessage from '../../PrintMessage';
import CustomAvatar from '@src/components/CustomAvatar';
import SellIcon from '@mui/icons-material/Sell';

function SidebarChat(props) {
	const data = props.chatData;

	const { t } = useTranslation();

	const navigate = useNavigate();

	const [isSelected, setSelected] = useState(false);
	const [isExpired, setExpired] = useState(props.chatData.isExpired);
	const [timeLeft, setTimeLeft] = useState();
	const [remainingSeconds, setRemainingSeconds] = useState();
	const { waId } = useParams();

	useEffect(() => {
		setSelected(props.selectedChats.includes(data.waId));
	}, [props.selectedChats]);

	const generateTagNames = () => {
		const generatedTagNames = [];
		data.tags?.forEach((tag) => {
			generatedTagNames.push(tag.name);
		});
		return generatedTagNames.join(', ');
	};

	useEffect(() => {
		function calculateRemaining() {
			const momentDate = moment.unix(data.lastReceivedMessageTimestamp);
			momentDate.add(1, 'day');
			const curDate = moment(new Date());
			const hours = momentDate.diff(curDate, 'hours');
			const seconds = momentDate.diff(curDate, 'seconds');

			setRemainingSeconds(seconds);

			let suffix;

			if (hours > 0) {
				suffix = 'h';
				setTimeLeft(hours + suffix);
			} else {
				const minutes = momentDate.diff(curDate, 'minutes');
				if (minutes > 1) {
					suffix = 'm';
					setTimeLeft(minutes + suffix);
				} else {
					if (seconds > 1) {
						suffix = 'm';
						setTimeLeft(minutes + suffix);
					} else {
						// Expired
						setExpired(true);
					}
				}
			}
		}

		setExpired(data.isExpired);

		// Initial
		calculateRemaining();

		let intervalId;
		if (!isExpired) {
			intervalId = setInterval(() => {
				calculateRemaining();
			}, 30000);
		}

		return () => {
			clearInterval(intervalId);
		};
	}, [isExpired, data.isExpired, data.lastMessageTimestamp]);

	const handleDroppedFiles = (event) => {
		if (isExpired) {
			event.preventDefault();
			return;
		}

		// Preparing dropped files
		const files = getDroppedFiles(event);

		// Switching to related chat
		navigate(`/main/chat/${data.waId}`);

		// Sending files via eventbus
		PubSub.publish(EVENT_TOPIC_DROPPED_FILES, files);
	};

	const handleClick = () => {
		if (props.isSelectionModeEnabled) {
			if (isDisabled()) return;

			let newSelectedState = !isSelected;

			props.setSelectedChats((prevState) => {
				if (newSelectedState) {
					if (!prevState.includes(data.waId)) {
						prevState.push(data.waId);
					}
				} else {
					prevState = prevState.filter((arrayItem) => arrayItem !== data.waId);
				}

				return [...prevState];
			});
		} else {
			navigate(`/main/chat/${data.waId}`);
		}
	};

	const isDisabled = () => {
		return isExpired && props.bulkSendPayload?.type !== 'template';
	};

	const hasFailedMessages = () => {
		let result = false;
		props.pendingMessages.forEach((pendingMessage) => {
			if (
				pendingMessage.requestBody?.wa_id === data.waId &&
				pendingMessage.isFailed === true
			)
				result = true;
		});

		return result;
	};

	const newMessages = props.newMessages[data.waId]?.newMessages;

	return (
		<ListItem button onClick={handleClick}>
			<div
				id={data.waId}
				className={
					'sidebarChatWrapper ' +
					(waId === data.waId ? 'activeChat ' : '') +
					(isExpired
						? 'expired '
						: remainingSeconds < 8 * 60 * 60
						? 'almostExpired '
						: '') +
					(props.isSelectionModeEnabled && isSelected ? 'isSelected ' : '')
				}
				onDrop={(event) => handleDroppedFiles(event)}
				onDragOver={(event) => handleDragOver(event)}
			>
				<div className="sidebarChat">
					{props.isSelectionModeEnabled && (
						<Checkbox
							className="sidebarChat__selection"
							checked={isSelected}
							color="primary"
							disabled={isDisabled()}
						/>
					)}

					<div className="sidebarChat__avatarWrapper">
						<CustomAvatar
							className="sidebarChat__avatarWrapper__mainAvatar"
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
		</ListItem>
	);
}

export default SidebarChat;
