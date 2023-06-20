// @ts-nocheck
import React, { MouseEvent, useEffect, useRef, useState } from 'react';
import '../../../styles/Sidebar.css';
import {
	Button,
	CircularProgress,
	Collapse,
	Divider,
	Fade,
	IconButton,
	Link,
	ListItemIcon,
	Menu,
	MenuItem,
	Tooltip,
	Zoom,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatListItem from '@src/components/ChatListItem';
import {
	containsLetters,
	generateInitialsHelper,
	isScrollable,
} from '@src/helpers/Helpers';
import {
	CHAT_KEY_PREFIX,
	EVENT_TOPIC_CHAT_ASSIGNMENT,
	EVENT_TOPIC_GO_TO_MSG_ID,
	EVENT_TOPIC_NEW_CHAT_MESSAGES,
	EVENT_TOPIC_UPDATE_PERSON_NAME,
} from '@src/Constants';
import { useNavigate, useParams } from 'react-router-dom';
import SearchBar from '../../SearchBar';
import SidebarContactResult from './SidebarContactResult';
import ChatModel from '../../../api/models/ChatModel';
import NewMessageModel from '../../../api/models/NewMessageModel';
import PubSub from 'pubsub-js';
import BusinessProfile from './BusinessProfile';
import ChangePasswordDialog from './ChangePasswordDialog';
import ChatMessageModel from '../../../api/models/ChatMessageModel';
import SearchMessageResult from '../../SearchMessageResult';
import { isMobile, isMobileOnly } from 'react-device-detect';
import ChatIcon from '@mui/icons-material/Chat';
import StartChat from '../../StartChat';
import { clearContactProvidersData } from '@src/helpers/StorageHelper';
import CloseIcon from '@mui/icons-material/Close';
import BulkSendIndicator from './BulkSendIndicator';
import SelectableChatTag from './SelectableChatTag';
import BulkSendActions from './BulkSendActions';
import { clearUserSession, generateCancelToken } from '@src/helpers/ApiHelper';
import Notifications from './Notifications/Notifications';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { getObjLength } from '@src/helpers/ObjectHelper';
import { getHubURL } from '@src/helpers/URLHelper';
import RetryFailedMessages from './RetryFailedMessages';
import UploadMediaIndicator from './UploadMediaIndicator';
import { Trans, useTranslation } from 'react-i18next';
import { AppConfig } from '@src/contexts/AppConfig';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import { filterChat } from '@src/helpers/SidebarHelper';
import { setCurrentUser } from '@src/store/reducers/currentUserReducer';
import { setTemplates } from '@src/store/reducers/templatesReducer';
import ChatsResponse from '../../../api/responses/ChatsResponse';
import { setFilterTag } from '@src/store/reducers/filterTagReducer';
import { setChatsCount } from '@src/store/reducers/chatsCountReducer';
import ChatTag from '../../ChatTag';
import CustomAvatar from '@src/components/CustomAvatar';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import styles from '@src/components/Main/Sidebar/Sidebar.module.css';
import SellIcon from '@mui/icons-material/Sell';
import { AxiosError, AxiosResponse, CancelTokenSource } from 'axios';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import { addChats, setChats } from '@src/store/reducers/chatsReducer';
import PasswordIcon from '@mui/icons-material/Password';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import SmsIcon from '@mui/icons-material/Sms';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import Alert from '@mui/material/Alert';
import {
	getMaxDirectRecipients,
	getMaxTagRecipients,
} from '@src/helpers/BulkSendHelper';
import FilterOption from '@src/components/FilterOption';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const Sidebar: React.FC = ({
	pendingMessages,
	setPendingMessages,
	isSendingPendingMessages,
	hasFailedMessages,
	lastSendAttemptAt,
	isUploadingMedia,
	newMessages,
	setNewMessages,
	setProgress,
	displayNotification,
	isBlurred,
	contactProvidersData,
	retrieveContactData,
	isChatOnly,
	setChatTagsListVisible,
	isSelectionModeEnabled,
	setSelectionModeEnabled,
	bulkSendPayload,
	selectedChats,
	setSelectedChats,
	selectedTags,
	setSelectedTags,
	finishBulkSendMessage,
	setLoadingNow,
	setUploadRecipientsCSVVisible,
	setBulkSendTemplateDialogVisible,
	setBulkSendTemplateViaCSVVisible,
	setBulkSendTemplateWithCallbackDialogVisible,
	setInitialResourceFailed,
	setSendBulkVoiceMessageDialogVisible,
}) => {
	// @ts-ignore
	const { apiService } = React.useContext(ApplicationContext);
	const config = React.useContext(AppConfig);

	const chats = useAppSelector((state) => state.chats.value);
	const tags = useAppSelector((state) => state.tags.value);
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const filterTag = useAppSelector((state) => state.filterTag.value);
	const chatsCount = useAppSelector((state) => state.chatsCount.value);

	const { t } = useTranslation();

	const { waId } = useParams();
	const chatsContainer = useRef(null);
	const [anchorEl, setAnchorEl] = useState<(EventTarget & Element) | null>(
		null
	);
	const [bulkMessageMenuAnchorEl, setBulkMessageMenuAnchorEl] = useState<
		(EventTarget & Element) | null
	>(null);
	const [keyword, setKeyword] = useState('');
	const [searchedKeyword, setSearchedKeyword] = useState('');
	const [chatMessages, setChatMessages] = useState({});
	const [contactResults, setContactResults] = useState({});
	const [isProfileVisible, setProfileVisible] = useState(false);
	const [isContactsVisible, setContactsVisible] = useState(false);
	const [isChangePasswordDialogVisible, setChangePasswordDialogVisible] =
		useState(false);
	const [isNotificationsVisible, setNotificationsVisible] = useState(false);
	const [isLoadingChats, setLoadingChats] = useState(false);
	const [isLoadingMoreChats, setLoadingMoreChats] = useState(false);

	const [isFiltersVisible, setFiltersVisible] = useState(false);

	const [filterAssignedToMe, setFilterAssignedToMe] = useState<boolean>(false);
	const [filterAssignedGroup, setFilterAssignedGroup] =
		useState<boolean>(false);

	const [missingChats, setMissingChats] = useState<string[]>([]);

	const timer = useRef<NodeJS.Timeout>();

	const navigate = useNavigate();

	const dispatch = useAppDispatch();

	const logOut = () => {
		clearUserSession(undefined, undefined, navigate);

		// TODO: Consider calling it in clearUserSession method
		dispatch(setCurrentUser(undefined));
		dispatch(setTemplates({}));

		hideMenu();
	};

	const forceClearContactProvidersData = () => {
		clearContactProvidersData();
		window.location.reload();
	};

	const displayMenu = (event: MouseEvent) => {
		setAnchorEl(event.currentTarget);
	};

	const hideMenu = () => {
		setAnchorEl(null);
	};

	const displayBulkMessageMenu = (event: MouseEvent) => {
		setBulkMessageMenuAnchorEl(event.currentTarget);
	};

	const hideBulkMessageMenu = () => {
		setBulkMessageMenuAnchorEl(null);
	};

	const showBulkSendTemplateDialog = () => {
		setBulkMessageMenuAnchorEl(null);
		setBulkSendTemplateDialogVisible(true);
	};

	const showBulkSendTemplateViaCSVDialog = () => {
		setBulkMessageMenuAnchorEl(null);
		//setBulkSendTemplateViaCSVVisible(true);
		setBulkSendTemplateWithCallbackDialogVisible(true);
	};

	const showSendBulkVoiceMessageDialog = () => {
		setBulkMessageMenuAnchorEl(null);
		setSendBulkVoiceMessageDialogVisible(true);
	};

	let cancelTokenSourceRef = useRef<CancelTokenSource | undefined>();

	useEffect(() => {
		// Generate a token
		cancelTokenSourceRef.current = generateCancelToken();

		timer.current = setTimeout(() => {
			listChats(cancelTokenSourceRef.current, true, undefined, true);

			if (keyword.trim().length > 0) {
				searchMessages(cancelTokenSourceRef.current);
			}

			setSearchedKeyword(keyword);
		}, 500);

		return () => {
			if (cancelTokenSourceRef.current) {
				cancelTokenSourceRef.current.cancel(
					'Operation canceled due to new request.'
				);
			}

			clearTimeout(timer.current);
		};
	}, [keyword, filterAssignedToMe, filterAssignedGroup, filterTag]);

	useEffect(() => {
		// New chatMessages
		const onNewMessages = function (msg: string, data: ChatMessageList) {
			// We don't need to update if chats are filtered
			if (keyword.trim().length === 0) {
				let newMissingChats: string[] = [];
				const nextState = { ...chats };
				let changedAny = false;

				Object.entries(data).forEach((message) => {
					//const msgId = message[0];
					const chatMessage = message[1];
					const chatMessageWaId = chatMessage.waId;

					const chatKey = CHAT_KEY_PREFIX + chatMessageWaId;

					// New chat, incoming or outgoing message
					// Check if chat with waId already exists
					if (!nextState.hasOwnProperty(chatKey)) {
						// Collect waId list to retrieve chats
						if (!newMissingChats.includes(chatMessageWaId)) {
							newMissingChats.push(chatMessageWaId);
						}
					}

					// Chats are ordered by incoming message date
					if (nextState.hasOwnProperty(chatKey)) {
						changedAny = true;

						// Update existing chat
						nextState[chatKey].setLastMessage(chatMessage.payload);

						// Incoming
						if (!chatMessage.isFromUs) {
							// Update name and initials on incoming message if name is missing
							const chat = nextState[chatKey];
							if (chat) {
								const chatName = chat.name;
								if (!containsLetters(chatName)) {
									// Update sidebar chat name
									nextState[chatKey].setName(chatMessage.senderName);

									// Check if current chat
									if (waId === chatMessageWaId) {
										PubSub.publish(
											EVENT_TOPIC_UPDATE_PERSON_NAME,
											chatMessage.senderName
										);
									}
								}
							}
						}
					}

					// New chatMessages
					if (
						!chatMessage.isFromUs &&
						(waId !== chatMessageWaId ||
							document.visibilityState === 'hidden' ||
							isBlurred)
					) {
						const preparedNewMessages = newMessages;
						if (newMessages[chatMessageWaId] === undefined) {
							preparedNewMessages[chatMessageWaId] = new NewMessageModel(
								chatMessageWaId,
								0
							);
						}

						// Increase number of new chatMessages
						preparedNewMessages[chatMessageWaId].newMessages++;

						setNewMessages({ ...preparedNewMessages });

						// Display a notification
						if (!chatMessage.isFromUs) {
							displayNotification(
								t('New messages'),
								t('You have new messages!'),
								chatMessageWaId
							);
						}
					}
				});

				// If anything has changed, sort chats
				if (changedAny) {
					// Sorting
					const sortedNextState = sortChats(nextState);
					dispatch(setChats({ ...sortedNextState }));
				}

				// Collect missing chats to load them periodically
				if (newMissingChats.length > 0) {
					setMissingChats((prevState) => {
						let nextState = prevState.concat(newMissingChats);

						// Unique wa ids
						return [...new Set(nextState)];
					});
				}
			}
		};

		const newChatMessagesEventToken = PubSub.subscribe(
			EVENT_TOPIC_NEW_CHAT_MESSAGES,
			onNewMessages
		);

		return () => {
			PubSub.unsubscribe(newChatMessagesEventToken);
		};
	}, [waId, isBlurred, chats, newMessages, missingChats, keyword]);

	useEffect(() => {
		const onChatAssignment = function (msg: string, data: any) {
			let newMissingChats: string[] = [];
			const nextState = { ...chats };

			Object.entries(data).forEach((message) => {
				//const msgId = message[0];
				const assignmentData = message[1];
				const assignmentEvent = assignmentData.assignmentEvent;

				if (assignmentEvent) {
					const chatKey = CHAT_KEY_PREFIX + assignmentData.waId;

					if (
						assignmentEvent.assigned_group_set ||
						assignmentEvent.assigned_to_user_set
					) {
						// Check if chat exists and is loaded
						if (!nextState.hasOwnProperty(chatKey)) {
							// Collect waId list to retrieve chats
							if (!newMissingChats.includes(assignmentData.waId)) {
								newMissingChats.push(assignmentData.waId);
							}
						}
					}
				}
			});

			if (newMissingChats.length > 0) {
				setMissingChats((prevState) => {
					let nextState = prevState.concat(newMissingChats);

					// Unique wa ids
					return [...new Set(nextState)];
				});
			}
		};

		const chatAssignmentEventToken = PubSub.subscribe(
			EVENT_TOPIC_CHAT_ASSIGNMENT,
			onChatAssignment
		);

		return () => {
			PubSub.unsubscribe(chatAssignmentEventToken);
		};
	}, [chats, missingChats]);

	useEffect(() => {
		let intervalId = setInterval(function () {
			if (missingChats?.length > 0) {
				missingChats.forEach((chatMessageWaId) => {
					console.log(
						`A new message is received from ${chatMessageWaId} but this chat is not loaded yet. Retrieving chat via API.`
					);
					retrieveChat(chatMessageWaId);
				});
			}
		}, 2000);

		return () => {
			clearInterval(intervalId);
		};
	}, [missingChats]);

	useEffect(() => {
		const chatsContainerCopy = chatsContainer.current;

		// To optimize scroll event
		let debounceTimer;

		function handleScroll(e) {
			if (debounceTimer) {
				window.clearTimeout(debounceTimer);
			}

			if (keyword) {
				window.clearTimeout(debounceTimer);
				return false;
			}

			debounceTimer = setTimeout(function () {
				// const threshold = 0;
				const el = e.target;

				if (isScrollable(el)) {
					if (el.scrollHeight - el.scrollTop - el.clientHeight < 1) {
						listChats(
							cancelTokenSourceRef.current,
							false,
							getObjLength(chats),
							false
						);
					}
				}
			}, 100);
		}

		chatsContainerCopy.addEventListener('scroll', handleScroll);

		return () => {
			clearTimeout(debounceTimer);
			chatsContainerCopy.removeEventListener('scroll', handleScroll);
		};
	}, [chats, keyword, filterTag]);

	const search = async (_keyword) => {
		setKeyword(_keyword);
	};

	useEffect(() => {
		if (isSelectionModeEnabled) {
			setContactsVisible(false);
		}
	}, [isSelectionModeEnabled]);

	const sortChats = (state) => {
		let sortedState = Object.entries(state).sort(
			(a, b) =>
				(b[1].lastReceivedMessageTimestamp ?? b[1].lastMessageTimestamp) -
				(a[1].lastReceivedMessageTimestamp ?? a[1].lastMessageTimestamp)
		);
		return Object.fromEntries(sortedState);
	};

	const listChats = (cancelTokenSource, isInitial, offset, replaceAll) => {
		if (!isInitial) {
			setLoadingMoreChats(true);
		} else {
			setLoadingNow('Chats');
		}

		// Reset chats count
		dispatch(setChatsCount(undefined));

		if (replaceAll) {
			setLoadingChats(true);
		}

		apiService.listChatsCall(
			keyword,
			filterTag?.id,
			20,
			offset,
			filterAssignedToMe ? true : undefined,
			filterAssignedGroup ? true : undefined,
			cancelTokenSource.token,
			(response) => {
				const chatsResponse = new ChatsResponse(response.data);

				dispatch(setChatsCount(chatsResponse.count));

				// Store
				if (replaceAll) {
					dispatch(setChats(chatsResponse.chats));
				} else {
					dispatch(addChats(chatsResponse.chats));
				}

				// In case param is undefined
				isInitial = isInitial === true;

				if (isInitial) {
					setProgress(100);
				}

				const willNotify = !isInitial;

				const preparedNewMessages = {};
				response.data.results.forEach((newMessage) => {
					const newWaId = newMessage.contact.waba_payload.wa_id;
					const newAmount = newMessage.new_messages;
					const prepared = new NewMessageModel(newWaId, newAmount);
					preparedNewMessages[prepared.waId] = prepared;
				});

				if (willNotify) {
					let hasAnyNewMessages = false;
					let chatMessageWaId;

					setNewMessages((prevState) => {
						Object.entries(preparedNewMessages).forEach((newMsg) => {
							const newMsgWaId = newMsg[0];
							const number = newMsg[1].newMessages;
							if (newMsgWaId !== waId) {
								// TODO: Consider a new contact (last part of the condition)
								if (
									prevState[newMsgWaId] &&
									number >
										prevState[newMsgWaId]
											.newMessages /*|| (!prevState[newMsgWaId] && number > 0)*/
								) {
									hasAnyNewMessages = true;

									// There can be multiple new chats, we take first one
									if (chatMessageWaId === newMsgWaId)
										chatMessageWaId = newMsgWaId;
								}
							}
						});

						// When state is a JSON object, it is unable to understand whether it is different or same and renders again
						// So we check if new state is actually different from previous state
						if (
							JSON.stringify(preparedNewMessages) !== JSON.stringify(prevState)
						) {
							return { ...prevState, ...preparedNewMessages };
						} else {
							return prevState;
						}
					});

					// Display a notification
					if (hasAnyNewMessages) {
						displayNotification(
							t('New messages'),
							t('You have new messages!'),
							chatMessageWaId
						);
					}
				} else {
					setNewMessages((prevState) => {
						return { ...prevState, ...preparedNewMessages };
					});
				}

				setLoadingMoreChats(false);
				setLoadingChats(false);
			},
			(error) => {
				console.log(error);

				setLoadingMoreChats(false);
				setLoadingChats(false);

				if (isInitial) {
					setInitialResourceFailed(true);
				}
			},
			navigate
		);
	};

	const retrieveChat = (chatWaId) => {
		apiService.retrieveChatCall(
			chatWaId,
			undefined,
			(response: AxiosResponse) => {
				// Remove this chat from missing chats list
				setMissingChats((prevState) =>
					prevState.filter((item) => item !== chatWaId)
				);

				const preparedChat = new ChatModel(response.data);

				// Don't display chat if tab case is "me" and chat is not assigned to user
				if (filterAssignedToMe) {
					if (
						!preparedChat.assignedToUser ||
						preparedChat.assignedToUser.id !== currentUser?.id
					) {
						console.log(
							'Chat will not be displayed as it does not belong to current tab.'
						);
						return;
					}
				} else if (filterAssignedGroup) {
					if (
						!preparedChat.assignedGroup ||
						currentUser?.isInGroup(preparedChat.assignedGroup.id)
					) {
						console.log(
							'Chat will not be displayed as it does not belong to current tab.'
						);
						return;
					}
				}

				const prevState = { ...chats };
				prevState[CHAT_KEY_PREFIX + chatWaId] = preparedChat;
				const sortedNextState = sortChats(prevState);

				dispatch(setChats({ ...sortedNextState }));
			},
			(error: AxiosError) => console.log(error)
		);
	};

	const searchMessages = (cancelTokenSource) => {
		apiService.listMessagesCall(
			undefined,
			keyword,
			filterTag?.id,
			30,
			undefined,
			undefined,
			undefined,
			cancelTokenSource.source,
			(response) => {
				const preparedMessages = {};
				response.data.results.forEach((message) => {
					const prepared = new ChatMessageModel(message);
					preparedMessages[prepared.id] = prepared;
				});

				setChatMessages(preparedMessages);
			},
			undefined,
			navigate
		);
	};

	const goToMessage = (chatMessage) => {
		if (waId !== chatMessage.waId) {
			navigate(`/main/chat/${chatMessage.waId}`, {
				state: {
					goToMessage: chatMessage,
				},
			});
		} else {
			PubSub.publish(EVENT_TOPIC_GO_TO_MSG_ID, chatMessage);
		}
	};

	const displayEditBusinessProfile = () => {
		setAnchorEl(null);
		setProfileVisible(true);
	};

	const goToSettings = () => {
		setAnchorEl(null);
		if (window.AndroidWebInterface) {
			window.AndroidWebInterface.goToSettings();
		}
	};

	const showChangePassword = () => {
		setAnchorEl(null);
		setChangePasswordDialogVisible(true);
	};

	const showChatTagsList = () => {
		setAnchorEl(null);
		setChatTagsListVisible(true);
	};

	const displayContacts = () => {
		setContactsVisible(true);
	};

	const clearFilter = () => {
		dispatch(setFilterTag(undefined));
	};

	const cancelSelection = () => {
		setSelectionModeEnabled(false);
		setSelectedChats([]);
		setSelectedTags([]);
	};

	const handleFinishBulkSendMessage = () => {
		setSelectionModeEnabled(false);
		finishBulkSendMessage();
	};

	const displayNotifications = () => {
		setNotificationsVisible(true);
	};

	return (
		<div className={'sidebar' + (isChatOnly ? ' hidden' : '')}>
			<div className="sidebar__header">
				<CustomAvatar
					src={currentUser?.profile?.avatar}
					onClick={() => setProfileVisible(true)}
					className="cursorPointer"
					generateBgColorBy={currentUser?.username}
				>
					{currentUser ? generateInitialsHelper(currentUser.username) : ''}
				</CustomAvatar>
				<div className="sidebar__headerRight">
					<Tooltip title={t('New chat')} disableInteractive>
						<IconButton
							onClick={displayContacts}
							data-test-id="new-chat"
							size="large"
						>
							<ChatIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title={t('Bulk send')} disableInteractive>
						<IconButton onClick={displayBulkMessageMenu} size="large">
							<DynamicFeedIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title={t('Notifications')} disableInteractive>
						<IconButton onClick={displayNotifications} size="large">
							<NotificationsIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title={t('Options')} disableInteractive>
						<IconButton
							onClick={displayMenu}
							data-test-id="options"
							size="large"
						>
							<MoreVertIcon />
						</IconButton>
					</Tooltip>
				</div>
			</div>

			{isSelectionModeEnabled && (
				<BulkSendActions
					selectedChats={selectedChats}
					setSelectedChats={setSelectedChats}
					selectedTags={selectedTags}
					cancelSelection={cancelSelection}
					finishBulkSendMessage={handleFinishBulkSendMessage}
					setUploadRecipientsCSVVisible={setUploadRecipientsCSVVisible}
				/>
			)}

			<div className={styles.searchOrFilterGroup}>
				<Collapse in={filterAssignedToMe || filterAssignedGroup}>
					<div
						className={cx({
							filterGroup: true,
							active: true,
						})}
					>
						{filterAssignedToMe && (
							<FilterOption
								icon={<PersonIcon />}
								label={t('Assigned to me')}
								onClick={() => setFilterAssignedToMe(false)}
								isActive
							/>
						)}
						{filterAssignedGroup && (
							<FilterOption
								icon={<GroupIcon />}
								label={t('Assigned group')}
								onClick={() => setFilterAssignedGroup(false)}
								isActive
							/>
						)}
					</div>
				</Collapse>

				<div className={styles.searchContainer}>
					<SearchBar
						onChange={(_keyword) => search(_keyword)}
						placeholder={t('Search or filter by tags, time etc.')}
						onFocus={() => setFiltersVisible(true)}
						onBlur={() => setTimeout(() => setFiltersVisible(false), 250)}
					/>
				</div>

				<Collapse
					in={isFiltersVisible || filterAssignedToMe || filterAssignedGroup}
				>
					<div
						className={cx({
							filterGroup: true,
							all: true,
						})}
					>
						{!filterAssignedToMe && (
							<FilterOption
								icon={<PersonIcon />}
								label={t('Assigned to me')}
								onClick={() => setFilterAssignedToMe(true)}
							/>
						)}
						{!filterAssignedGroup && (
							<FilterOption
								icon={<GroupIcon />}
								label={t('Assigned group')}
								onClick={() => setFilterAssignedGroup(true)}
							/>
						)}
						<FilterOption
							icon={<SellIcon />}
							label={t('Tag')}
							onClick={console.log}
						/>
						<FilterOption
							icon={<SellIcon />}
							label={t('Time')}
							onClick={console.log}
						/>
					</div>
				</Collapse>
			</div>

			{filterTag && (
				<div className="sidebar__clearFilter">
					<div className="sidebar__clearFilter__body mb-1">
						<Trans
							count={chatsCount ?? 0}
							i18nKey="Showing only: <1></1> <3>%(tag)s</3> (%(count)d chat)"
							values={{
								postProcess: 'sprintf',
								sprintf: {
									tag: filterTag.name,
									count: chatsCount ?? 0,
								},
							}}
						>
							Showing only: <ChatTag id={filterTag.id} />{' '}
							<span className="bold">%(tag)s</span> (%(count)d chat)
						</Trans>
					</div>
					<Button
						className="sidebar__clearFilter__clear"
						size="small"
						startIcon={<CloseIcon />}
						onClick={clearFilter}
					>
						{t('Click to clear filter')}
					</Button>
				</div>
			)}

			<div className="sidebar__results" ref={chatsContainer}>
				{isSelectionModeEnabled && (
					<>
						<Alert severity="info" className={styles.bulkAlert}>
							{t(
								'Please select up to %s direct recipients.',
								getMaxDirectRecipients()
							)}
						</Alert>

						{tags && (
							<Alert severity="info" className={styles.bulkAlert}>
								{t(
									'Please select tags that target up to %s recipients in total.',
									getMaxTagRecipients()
								)}
							</Alert>
						)}

						{bulkSendPayload?.type !== ChatMessageModel.TYPE_TEMPLATE && (
							<Alert severity="warning" className={styles.bulkAlert}>
								<Trans>
									Session messages can be sent only to recipients who wrote to
									you within last 24 hours. To send messages to expired chats,
									use{' '}
									<a onClick={showBulkSendTemplateDialog}>
										Bulk send a template
									</a>{' '}
									function.
								</Trans>
							</Alert>
						)}

						{tags && (
							<>
								<h3>{t('Tags')}</h3>
								<div>
									{Object.entries(tags).map((tag) => (
										<SelectableChatTag
											key={tag[0]}
											data={tag[1]}
											selectedTags={selectedTags}
											setSelectedTags={setSelectedTags}
										/>
									))}
								</div>
							</>
						)}
					</>
				)}

				{(searchedKeyword.trim().length > 0 || isSelectionModeEnabled) && (
					<h3>{t('Chats')}</h3>
				)}

				<div className="sidebar__results__chats">
					{Object.entries(chats)
						.filter((chat) => {
							// Filter by helper method
							return filterChat(
								currentUser,
								chat[1],
								filterAssignedToMe,
								filterAssignedGroup
							);
						})
						.map((chat) => (
							<ChatListItem
								key={chat[0]}
								chatData={chat[1]}
								pendingMessages={pendingMessages}
								newMessages={newMessages}
								keyword={searchedKeyword}
								contactProvidersData={contactProvidersData}
								retrieveContactData={retrieveContactData}
								filterAssignedToMe={filterAssignedToMe}
								filterAssignedGroup={filterAssignedGroup}
								bulkSendPayload={bulkSendPayload}
								isSelectionModeEnabled={isSelectionModeEnabled}
								selectedChats={selectedChats}
								setSelectedChats={setSelectedChats}
							/>
						))}

					{Object.keys(chats).length === 0 && (
						<span className="sidebar__results__chats__noResult">
							{searchedKeyword.trim().length > 0 ? (
								<span>
									<Trans>
										No chats found for:{' '}
										<span className="searchOccurrence">{searchedKeyword}</span>
									</Trans>
								</span>
							) : (
								!isLoadingChats && (
									<span>{t("You don't have any chats yet.")}</span>
								)
							)}
						</span>
					)}
				</div>

				{searchedKeyword.trim().length > 0 &&
					getObjLength(contactResults) > 0 && (
						<>
							<h3>{t('Contacts')}</h3>
							<div className="sidebar__results__contacts">
								{Object.entries(contactResults).map((contactResult) => (
									<SidebarContactResult
										key={contactResult[0]}
										chatData={contactResult[1]}
									/>
								))}
							</div>
						</>
					)}

				{searchedKeyword.trim().length > 0 &&
					getObjLength(chatMessages) > 0 && (
						<>
							<h3>{t('Messages')}</h3>
							<div className="sidebar__results__messages">
								{Object.entries(chatMessages).map((message) => (
									<SearchMessageResult
										key={message[0]}
										waId={waId}
										messageData={message[1]}
										keyword={searchedKeyword}
										displaySender={true}
										onClick={(chatMessage) => goToMessage(chatMessage)}
									/>
								))}
							</div>
						</>
					)}
			</div>

			<Fade in={isLoadingMoreChats} unmountOnExit>
				<div className="sidebar__loadingMore">
					<Zoom in={isLoadingMoreChats}>
						<div className="sidebar__loadingMore__wrapper">
							<CircularProgress size={28} />
						</div>
					</Zoom>
				</div>
			</Fade>

			{isContactsVisible && (
				<StartChat onHide={() => setContactsVisible(false)} />
			)}

			{isProfileVisible && (
				<BusinessProfile
					onHide={() => setProfileVisible(false)}
					displayEditBusinessProfile={displayEditBusinessProfile}
					setChangePasswordDialogVisible={setChangePasswordDialogVisible}
				/>
			)}

			{isUploadingMedia && !isMobileOnly && <UploadMediaIndicator />}

			{hasFailedMessages && (
				<RetryFailedMessages
					pendingMessages={pendingMessages}
					setPendingMessages={setPendingMessages}
					isSendingPendingMessages={isSendingPendingMessages}
					lastSendAttemptAt={lastSendAttemptAt}
					contactProvidersData={contactProvidersData}
					chats={chats}
				/>
			)}

			<BulkSendIndicator />

			<Menu
				anchorEl={anchorEl}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={hideMenu}
				elevation={3}
			>
				<MenuItem onClick={showChatTagsList}>
					<ListItemIcon>
						<SellIcon />
					</ListItemIcon>
					{t('Tags')}
				</MenuItem>
				<Divider />
				<MenuItem
					className="sidebar__menu__refresh"
					onClick={() => window.location.reload()}
				>
					{t('Refresh')}
				</MenuItem>
				<MenuItem onClick={showChangePassword}>
					<ListItemIcon>
						<PasswordIcon />
					</ListItemIcon>
					{t('Change password')}
				</MenuItem>
				<MenuItem onClick={forceClearContactProvidersData}>
					<ListItemIcon>
						<CloudSyncIcon />
					</ListItemIcon>
					{t('Refresh contacts')}
				</MenuItem>
				{currentUser?.isAdmin && <Divider />}
				{currentUser?.isAdmin && (
					<MenuItem
						component={Link}
						href={getHubURL(config.API_BASE_URL)}
						target="_blank"
					>
						<ListItemIcon>
							<AdminPanelSettingsIcon />
						</ListItemIcon>
						{t('Admin panel')}
					</MenuItem>
				)}
				{isMobile && (
					<MenuItem onClick={goToSettings}>{t('Settings (App Only)')}</MenuItem>
				)}
				<Divider />
				<MenuItem onClick={logOut} data-test-id="logout-button">
					<ListItemIcon>
						<LogoutIcon />
					</ListItemIcon>
					{t('Logout')}
				</MenuItem>
			</Menu>

			<Menu
				anchorEl={bulkMessageMenuAnchorEl}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				keepMounted
				open={Boolean(bulkMessageMenuAnchorEl)}
				onClose={hideBulkMessageMenu}
				elevation={3}
			>
				<MenuItem onClick={showBulkSendTemplateDialog}>
					<ListItemIcon>
						<SmsIcon />
					</ListItemIcon>
					{t('Bulk send a template')}
				</MenuItem>
				<MenuItem onClick={showBulkSendTemplateViaCSVDialog}>
					<ListItemIcon>
						<UploadFileIcon />
					</ListItemIcon>
					{t('Bulk send template with CSV')}
				</MenuItem>
				<MenuItem onClick={showSendBulkVoiceMessageDialog}>
					<ListItemIcon>
						<KeyboardVoiceIcon />
					</ListItemIcon>
					{t('Bulk send a voice message')}
				</MenuItem>
			</Menu>

			<ChangePasswordDialog
				open={isChangePasswordDialogVisible}
				setOpen={setChangePasswordDialogVisible}
			/>

			{isNotificationsVisible && (
				<Notifications onHide={() => setNotificationsVisible(false)} />
			)}
		</div>
	);
};

export default Sidebar;
