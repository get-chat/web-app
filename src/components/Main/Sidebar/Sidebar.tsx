import React, { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import '../../../styles/Sidebar.css';
import {
	CircularProgress,
	ClickAwayListener,
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
	CHAT_FILTER_PREFIX,
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
import BulkSendIndicator from './BulkSendIndicator';
import SelectableChatTag from './SelectableChatTag';
import BulkSendActions from './BulkSendActions/BulkSendActions';
import { clearUserSession, generateCancelToken } from '@src/helpers/ApiHelper';
import Notifications from './Notifications/Notifications';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { getObjLength } from '@src/helpers/ObjectHelper';
import { getHubURL } from '@src/helpers/URLHelper';
import RetryFailedMessages from './RetryFailedMessages';
import UploadMediaIndicator from './UploadMediaIndicator';
import { Trans, useTranslation } from 'react-i18next';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import {
	filterChat,
	handleChatAssignmentEvent,
} from '@src/helpers/SidebarHelper';
import { setCurrentUser } from '@src/store/reducers/currentUserReducer';
import { setTemplates } from '@src/store/reducers/templatesReducer';
import ChatsResponse from '../../../api/responses/ChatsResponse';
import { setFilterTagId } from '@src/store/reducers/filterTagIdReducer';
import { setChatsCount } from '@src/store/reducers/chatsCountReducer';
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
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import DateRangeIcon from '@mui/icons-material/DateRange';
import SettingsIcon from '@mui/icons-material/Settings';
import Alert from '@mui/material/Alert';
import {
	getMaxDirectRecipients,
	getMaxTagRecipients,
} from '@src/helpers/BulkSendHelper';
import FilterOption from '@src/components/FilterOption';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import FilterListIcon from '@mui/icons-material/FilterList';
import classNames from 'classnames/bind';
import ChatList from '@src/interfaces/ChatList';
import ChatMessagesResponse from '@src/api/responses/ChatMessagesResponse';
import DateRangeDialog from '@src/components/DateRangeDialog';
import {
	convertDateToUnixTimestamp,
	formatDateRangeFilters,
} from '@src/helpers/DateHelper';
import GroupModel from '@src/api/models/GroupModel';
import TagModel from '@src/api/models/TagModel';
import useChatFilters from '@src/components/Main/Sidebar/useChatFilters';
import { ViewportList } from 'react-viewport-list';
import BusinessProfileAvatar from '@src/components/BusinessProfileAvatar';
import UserProfile from '@src/components/UserProfile';
import {
	setExportChat,
	setSelectionModeEnabled,
	setState,
} from '@src/store/reducers/UIReducer';
import ExportChatActions from '@src/components/Main/Sidebar/ExportChatActions/ExportChatActions';
import PersonModel from '@src/api/models/PersonModel';

const CHAT_LIST_SCROLL_OFFSET = 2000;
const cx = classNames.bind(styles);

const Sidebar: React.FC<any> = ({
	isLoaded,
	newMessages,
	setNewMessages,
	displayNotification,
	contactProvidersData,
	isChatOnly,
	setChatTagsListVisible,
	bulkSendPayload,
	finishBulkSendMessage,
	setUploadRecipientsCSVVisible,
	setBulkSendTemplateDialogVisible,
	setBulkSendTemplateViaCSVVisible,
	setBulkSendTemplateWithCallbackDialogVisible,
	setInitialResourceFailed,
	setSendBulkVoiceMessageDialogVisible,
}) => {
	// @ts-ignore
	const { apiService } = React.useContext(ApplicationContext);
	const config = React.useContext(AppConfigContext);

	const {
		hasFailedMessages,
		isBlurred,
		isSendingPendingMessages,
		isUploadingMedia,
		isReadOnly,
		selectedTags,
		selectedChats,
		isSelectionModeEnabled,
		isBulkSend,
		isExportChat,
	} = useAppSelector((state) => state.UI);
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const chats = useAppSelector((state) => state.chats.value);
	const chatsCount = useAppSelector((state) => state.chatsCount.value);
	const tags = useAppSelector((state) => state.tags.value);
	const groups = useAppSelector((state) => state.groups.value);

	const { t } = useTranslation();

	const {
		dynamicFilters,
		removeDynamicFilter,
		keyword,
		chatsLimit,
		chatsOffset,
		setKeyword,
		filterTagId,
		filterAssignedToMe,
		setFilterAssignedToMe,
		filterAssignedGroupId,
		setFilterAssignedGroupId,
		filterStartDate,
		setFilterStartDate,
		filterEndDate,
		setFilterEndDate,
	} = useChatFilters();

	const { waId } = useParams();
	const [anchorEl, setAnchorEl] = useState<(EventTarget & Element) | null>(
		null
	);
	const [bulkMessageMenuAnchorEl, setBulkMessageMenuAnchorEl] = useState<
		(EventTarget & Element) | null
	>(null);

	const filteredChats = useMemo(
		() =>
			Object.values(chats).filter((chat) => {
				// Filter by helper method
				return filterChat(
					currentUser,
					chat,
					filterTagId,
					filterAssignedToMe,
					filterAssignedGroupId
				);
			}),
		[chats, currentUser, filterTagId, filterAssignedToMe, filterAssignedGroupId]
	);

	const filteredChatsCount = useMemo(
		() => getObjLength(filteredChats),
		[filteredChats]
	);

	const [searchedKeyword, setSearchedKeyword] = useState('');
	const [chatMessages, setChatMessages] = useState<ChatMessageList>({});
	const [contactResults, setContactResults] = useState<{
		[key: string]: PersonModel;
	}>({});
	const [isBusinessProfileVisible, setBusinessProfileVisible] = useState(false);
	const [isUserProfileVisible, setUserProfileVisible] = useState(false);
	const [isContactsVisible, setContactsVisible] = useState(false);
	const [isChangePasswordDialogVisible, setChangePasswordDialogVisible] =
		useState(false);
	const [isNotificationsVisible, setNotificationsVisible] = useState(false);
	const [isLoadingChats, setLoadingChats] = useState(false);
	const [isLoadingMoreChats, setLoadingMoreChats] = useState(false);

	const [isFiltersVisible, setFiltersVisible] = useState(true);
	const [isDateRangeDialogVisible, setDateRangeDialogVisible] = useState(false);

	const [exportStartDate, setExportStartDate] = useState<Date | undefined>();
	const [exportEndDate, setExportEndDate] = useState<Date | undefined>();

	const [tagsMenuAnchorEl, setTagsMenuAnchorEl] = useState<Element>();
	const [groupsMenuAnchorEl, setGroupsMenuAnchorEl] = useState<Element>();

	const [missingChats, setMissingChats] = useState<string[]>([]);

	const chatListRef = useRef<HTMLDivElement | null>(null);
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

	const exportChats = () => {
		setAnchorEl(null);
		dispatch(setSelectionModeEnabled(true));
		dispatch(setExportChat(true));
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
		// Trigger loading indicator
		setLoadingChats(true);

		// Generate a token
		cancelTokenSourceRef.current = generateCancelToken();

		timer.current = setTimeout(() => {
			listChats(cancelTokenSourceRef.current, true, chatsOffset, true);

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
	}, [
		dynamicFilters,
		keyword,
		filterAssignedToMe,
		filterAssignedGroupId,
		filterTagId,
		filterStartDate,
		filterEndDate,
	]);

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
						if (chatMessageWaId && !newMissingChats.includes(chatMessageWaId)) {
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
						if (chatMessageWaId && newMessages[chatMessageWaId] === undefined) {
							preparedNewMessages[chatMessageWaId] = new NewMessageModel(
								chatMessageWaId,
								0
							);
						}

						// Increase number of new chatMessages
						if (chatMessageWaId) {
							preparedNewMessages[chatMessageWaId].newMessages++;
						}

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
			// Handle event inside helper method
			const result = handleChatAssignmentEvent(currentUser, { ...chats }, data);

			const isChatsChanged = result?.isChatsChanged ?? false;
			const chatsCurrentState = result?.chats ?? {};
			const newMissingChats = result?.newMissingChats ?? [];

			// If anything has changed, sort chats
			if (isChatsChanged) {
				// Sorting
				const sortedNextState = sortChats(chatsCurrentState);
				dispatch(setChats({ ...sortedNextState }));
			}

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
		const chatsContainerCopy = chatListRef.current;

		// To optimize scroll event
		let debounceTimer: NodeJS.Timeout;

		const handleScroll: EventListenerOrEventListenerObject = (e: Event) => {
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

				if (el instanceof Element && isScrollable(el)) {
					if (
						el.scrollHeight - el.scrollTop - el.clientHeight <
						CHAT_LIST_SCROLL_OFFSET
					) {
						listChats(
							cancelTokenSourceRef.current,
							false,
							getObjLength(chats),
							false
						);
					}
				}
			}, 100);
		};

		chatsContainerCopy?.addEventListener('scroll', handleScroll);

		return () => {
			clearTimeout(debounceTimer);
			chatsContainerCopy?.removeEventListener('scroll', handleScroll);
		};
	}, [chats, keyword, filterTagId]);

	const search = async (_keyword: string) => {
		setKeyword(_keyword);
	};

	useEffect(() => {
		if (isSelectionModeEnabled) {
			setContactsVisible(false);
		}
	}, [isSelectionModeEnabled]);

	const sortChats = (state: ChatList) => {
		let sortedState = Object.entries(state).sort(
			(a, b) =>
				(b[1].lastReceivedMessageTimestamp ?? b[1].lastMessageTimestamp ?? 0) -
				(a[1].lastReceivedMessageTimestamp ?? a[1].lastMessageTimestamp ?? 0)
		);
		return Object.fromEntries(sortedState);
	};

	const listChats = (
		cancelTokenSource?: CancelTokenSource,
		isInitial: boolean = false,
		offset?: number,
		replaceAll: boolean = false
	) => {
		if (!isInitial) {
			setLoadingMoreChats(true);
		} else {
			dispatch(setState({ loadingComponent: 'Chats' }));
		}

		// Reset chats count
		//dispatch(setChatsCount(undefined));

		setLoadingChats(true);

		// Convert dates to Unix timestamps
		const messagesSinceTime = filterStartDate
			? convertDateToUnixTimestamp(filterStartDate)
			: undefined;
		const messageBeforeTime = filterEndDate
			? convertDateToUnixTimestamp(filterEndDate)
			: undefined;

		apiService.listChatsCall(
			dynamicFilters,
			keyword,
			filterTagId,
			chatsLimit,
			offset,
			filterAssignedToMe ? true : undefined,
			filterAssignedGroupId,
			messageBeforeTime,
			messagesSinceTime,
			cancelTokenSource?.token,
			(response: AxiosResponse) => {
				const chatsResponse = new ChatsResponse(response.data);

				dispatch(setChatsCount(chatsResponse.count));

				// Store
				if (replaceAll) {
					dispatch(setChats(chatsResponse.chats));
				} else {
					dispatch(addChats(chatsResponse.chats));
				}

				if (isInitial) {
					dispatch(setState({ loadingProgress: 100 }));
				}

				const willNotify = !isInitial;

				const preparedNewMessages: { [key: string]: NewMessageModel } = {};
				response.data.results.forEach((newMessage: any) => {
					const newWaId = newMessage.contact.waba_payload.wa_id;
					const newAmount = newMessage.new_messages;
					const prepared = new NewMessageModel(newWaId, newAmount);
					preparedNewMessages[prepared.waId] = prepared;
				});

				if (willNotify) {
					let hasAnyNewMessages = false;
					let chatMessageWaId: string | undefined;

					setNewMessages((prevState: any) => {
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
					setNewMessages((prevState: any) => {
						return { ...prevState, ...preparedNewMessages };
					});
				}

				setLoadingMoreChats(false);
				setLoadingChats(false);
			},
			(error: AxiosError) => {
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

	const retrieveChat = (chatWaId: string) => {
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
				} else if (filterAssignedGroupId) {
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

	const searchMessages = (cancelTokenSource?: CancelTokenSource) => {
		// Convert dates to Unix timestamps
		const messagesSinceTime = filterStartDate
			? convertDateToUnixTimestamp(filterStartDate)
			: undefined;
		const messageBeforeTime = filterEndDate
			? convertDateToUnixTimestamp(filterEndDate)
			: undefined;

		apiService.listMessagesCall(
			undefined,
			keyword,
			filterTagId,
			30,
			undefined,
			filterAssignedToMe ? true : undefined,
			filterAssignedGroupId,
			messageBeforeTime,
			messagesSinceTime,
			cancelTokenSource?.token,
			(response: AxiosResponse) => {
				const messagesResponse = new ChatMessagesResponse(response.data);
				setChatMessages(messagesResponse.messages);
			},
			undefined,
			navigate
		);
	};

	const goToMessage = (chatMessage: ChatMessageModel) => {
		if (waId !== chatMessage.waId) {
			navigate(`/main/chat/${chatMessage.waId}`, {
				state: {
					goToMessage: {
						id: chatMessage.id,
						timestamp: chatMessage.timestamp,
					},
				},
			});
		} else {
			PubSub.publish(EVENT_TOPIC_GO_TO_MSG_ID, chatMessage);
		}
	};

	const displayEditBusinessProfile = () => {
		setAnchorEl(null);
		setBusinessProfileVisible(true);
	};

	const goToSettings = () => {
		setAnchorEl(null);
		// @ts-ignore
		if (window.AndroidWebInterface) {
			// @ts-ignore
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

	const cancelSelection = () => {
		dispatch(setSelectionModeEnabled(false));
		dispatch(setState({ selectedTags: [], selectedChats: [] }));
	};

	const handleFinishBulkSendMessage = () => {
		dispatch(setSelectionModeEnabled(false));
		finishBulkSendMessage();
	};

	const displayNotifications = () => {
		setNotificationsVisible(true);
	};

	const isAnyActiveFilter = Boolean(
		getObjLength(dynamicFilters) > 0 ||
			filterAssignedToMe ||
			filterAssignedGroupId ||
			filterTagId ||
			filterStartDate
	);
	const isForceDisplayFilters = isFiltersVisible || isAnyActiveFilter;

	return (
		<div className={'sidebar' + (isChatOnly ? ' hidden' : '')}>
			<div className="sidebar__header">
				<div className={styles.sessionContainer}>
					<Tooltip title={t('Business Profile')} disableInteractive>
						<div>
							<BusinessProfileAvatar
								className={styles.businessAvatar}
								onClick={() => setBusinessProfileVisible(true)}
							/>
						</div>
					</Tooltip>
					<Tooltip title={currentUser?.username} disableInteractive>
						<div>
							<CustomAvatar
								generateBgColorBy={currentUser?.username}
								className={styles.userAvatar}
								onClick={() => setUserProfileVisible(true)}
							>
								{currentUser
									? generateInitialsHelper(currentUser?.username)
									: ''}
							</CustomAvatar>
						</div>
					</Tooltip>
				</div>

				<div className="sidebar__headerRight">
					{!isReadOnly && (
						<Tooltip title={t('New chat')} disableInteractive>
							<IconButton
								onClick={displayContacts}
								data-test-id="new-chat"
								size="large"
							>
								<ChatIcon />
							</IconButton>
						</Tooltip>
					)}
					{!isReadOnly && (
						<Tooltip title={t('Bulk send')} disableInteractive>
							<IconButton onClick={displayBulkMessageMenu} size="large">
								<DynamicFeedIcon />
							</IconButton>
						</Tooltip>
					)}
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

			{isSelectionModeEnabled && isBulkSend && (
				<BulkSendActions
					cancelSelection={cancelSelection}
					finishBulkSendMessage={handleFinishBulkSendMessage}
					setUploadRecipientsCSVVisible={setUploadRecipientsCSVVisible}
				/>
			)}

			{isSelectionModeEnabled && isExportChat && (
				<ExportChatActions
					onShowDateRange={() => setDateRangeDialogVisible(true)}
					onExport={() => {
						// TODO: Export chats
						setTimeout(
							() =>
								alert(
									'TODO: Export chats for: ' +
										JSON.stringify(selectedChats) +
										' ' +
										JSON.stringify(selectedTags)
								),
							1
						);

						cancelSelection();
						dispatch(setExportChat(false));
					}}
					onCancel={cancelSelection}
				/>
			)}

			<ClickAwayListener
				onClickAway={() => {
					if (!keyword && !isAnyActiveFilter && isLoaded) {
						setFiltersVisible(false);
					}
				}}
			>
				<div
					className={cx({
						searchOrFilterGroup: true,
						expanded: isForceDisplayFilters,
					})}
				>
					<Collapse in={Boolean(isAnyActiveFilter || keyword)}>
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
							{filterAssignedGroupId && (
								<FilterOption
									icon={<GroupIcon />}
									label={groups[filterAssignedGroupId]?.name ?? t('Unknown')}
									onClick={() => setFilterAssignedGroupId(undefined)}
									isActive
								/>
							)}
							{filterTagId && (
								<FilterOption
									icon={<SellIcon />}
									label={
										tags?.filter((item) => item.id === filterTagId)?.[0]
											?.name ?? t('Unknown')
									}
									onClick={() => dispatch(setFilterTagId(undefined))}
									isActive
								/>
							)}
							{filterStartDate && (
								<FilterOption
									icon={<DateRangeIcon />}
									label={formatDateRangeFilters(filterStartDate, filterEndDate)}
									onClick={() => {
										setFilterStartDate(undefined);
										setFilterEndDate(undefined);
									}}
									isActive
								/>
							)}
							{Object.entries(dynamicFilters).map((item) => (
								<FilterOption
									key={item[0]}
									icon={<FilterListIcon />}
									label={`${item[0].slice(CHAT_FILTER_PREFIX.length)}: ${
										item[1]
									}`}
									onClick={() => removeDynamicFilter(item[0])}
									isActive
								/>
							))}
						</div>
					</Collapse>

					<SearchBar
						value={keyword}
						onChange={(_keyword) => search(_keyword)}
						placeholder={t('Search, filter by tags, time, etc.')}
						onFocus={() => setFiltersVisible(true)}
					/>

					<Collapse in={isForceDisplayFilters}>
						<>
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
								<FilterOption
									icon={<GroupIcon />}
									label={t('Assigned group')}
									onClick={(event: MouseEvent) => {
										if (event.currentTarget instanceof Element) {
											setGroupsMenuAnchorEl(event.currentTarget);
										}
									}}
								/>
								{tags?.length > 0 && (
									<FilterOption
										icon={<SellIcon />}
										label={t('Tag')}
										onClick={(event: MouseEvent) => {
											if (event.currentTarget instanceof Element) {
												setTagsMenuAnchorEl(event.currentTarget);
											}
										}}
									/>
								)}
								<FilterOption
									icon={<DateRangeIcon />}
									label={t('Time')}
									onClick={() => setDateRangeDialogVisible(true)}
								/>
							</div>

							{(keyword || isAnyActiveFilter) && (
								<div className={styles.chatsCount}>
									{isLoadingChats && <CircularProgress size={14} />}
									{isLoadingChats ? (
										t('Loading chats')
									) : (
										<Trans
											count={chatsCount ?? 0}
											values={{
												postProcess: 'sprintf',
												sprintf: [chatsCount ?? 0],
											}}
										>
											%d chat found
										</Trans>
									)}
								</div>
							)}
						</>
					</Collapse>

					<Menu
						className={styles.filterMenu}
						anchorEl={tagsMenuAnchorEl}
						open={Boolean(tagsMenuAnchorEl)}
						onClose={() => setTagsMenuAnchorEl(undefined)}
						elevation={3}
					>
						{tags &&
							tags.slice(0, 10).map((tag: TagModel) => (
								<MenuItem
									onClick={() => {
										dispatch(setFilterTagId(tag.id));
										setTagsMenuAnchorEl(undefined);
									}}
									key={tag.id}
								>
									<ListItemIcon>
										<SellIcon
											style={{
												fill: tag.color,
											}}
										/>
									</ListItemIcon>
									{tag.name}
								</MenuItem>
							))}
						<Divider />
						{tags && tags.length > 10 && (
							<MenuItem
								onClick={() => {
									showChatTagsList();
									setTagsMenuAnchorEl(undefined);
								}}
							>
								<ListItemIcon>
									<UnfoldMoreIcon />
								</ListItemIcon>
								{t('More')}
							</MenuItem>
						)}
						<MenuItem
							component={Link}
							href={getHubURL(config?.API_BASE_URL ?? '') + 'main/tag/'}
							target="_blank"
						>
							<ListItemIcon>
								<SettingsIcon />
							</ListItemIcon>
							{t('Manage tags')}
						</MenuItem>
					</Menu>

					<Menu
						className={styles.filterMenu}
						anchorEl={groupsMenuAnchorEl}
						open={Boolean(groupsMenuAnchorEl)}
						onClose={() => setGroupsMenuAnchorEl(undefined)}
						elevation={3}
					>
						{groups &&
							Object.values(groups)
								.filter((item) =>
									currentUser?.groups?.some(
										(userGroup) => userGroup.id === item.id
									)
								)
								.map((group: GroupModel) => (
									<MenuItem
										onClick={() => {
											setFilterAssignedGroupId(group.id);
											setGroupsMenuAnchorEl(undefined);
										}}
										key={group.id}
									>
										{group.name}
									</MenuItem>
								))}
					</Menu>

					{/* Filter or export by date range */}
					<DateRangeDialog
						open={isDateRangeDialogVisible}
						setOpen={setDateRangeDialogVisible}
						onDone={(startDate, endDate) => {
							if (isExportChat) {
								setExportStartDate(startDate);
								setExportEndDate(endDate);

								// Close export chat UI
								cancelSelection();
								dispatch(setExportChat(false));

								// TODO: Export chats by date
								setTimeout(
									() =>
										alert(
											'TODO: Export chats for: ' +
												formatDateRangeFilters(startDate, endDate)
										),
									1
								);
							} else {
								setFilterStartDate(startDate);
								setFilterEndDate(endDate);
							}
						}}
					/>
				</div>
			</ClickAwayListener>

			<div className="sidebar__results">
				{isSelectionModeEnabled && isBulkSend && (
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
					</>
				)}

				{isSelectionModeEnabled && (
					<>
						{tags && (
							<>
								<h3>{t('Tags')}</h3>
								<div>
									{Object.entries(tags).map((tag) => (
										<SelectableChatTag key={tag[0]} data={tag[1]} />
									))}
								</div>
							</>
						)}
					</>
				)}

				{(searchedKeyword.trim().length > 0 || isSelectionModeEnabled) && (
					<h3>{t('Chats')}</h3>
				)}

				{!isLoadingChats &&
					searchedKeyword.trim().length === 0 &&
					!isAnyActiveFilter &&
					filteredChatsCount === 0 && (
						<span className="sidebar__results__chats__noResult">
							<span>{t("You don't have any chats yet.")}</span>
						</span>
					)}

				{filteredChatsCount > 0 && (
					<div
						className={cx({
							sidebar__results__chats: true,
							chatList: true,
							unpacked:
								searchedKeyword.trim().length > 0 || isSelectionModeEnabled,
						})}
						ref={chatListRef}
					>
						<ViewportList
							viewportRef={chatListRef}
							items={filteredChats}
							overscan={5}
						>
							{(item) => (
								<ChatListItem
									key={item.waId}
									chatData={item}
									newMessages={newMessages}
									keyword={searchedKeyword}
									contactProvidersData={contactProvidersData}
									filterAssignedToMe={filterAssignedToMe}
									filterAssignedGroupId={filterAssignedGroupId}
									bulkSendPayload={bulkSendPayload}
								/>
							)}
						</ViewportList>
					</div>
				)}

				{searchedKeyword.trim().length > 0 &&
					getObjLength(contactResults) > 0 && (
						<>
							<h3>{t('Contacts')}</h3>
							<div className="sidebar__results__contacts">
								{Object.entries(contactResults).map((contactResult) => (
									<SidebarContactResult
										key={contactResult[0]}
										contactData={contactResult[1]}
										chatData={chats[contactResult[0]]}
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
										messageData={message[1]}
										keyword={searchedKeyword}
										displaySender={true}
										onClick={(chatMessage: ChatMessageModel) =>
											goToMessage(chatMessage)
										}
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

			{isUserProfileVisible && (
				<UserProfile
					onHide={() => setUserProfileVisible(false)}
					setChangePasswordDialogVisible={setChangePasswordDialogVisible}
				/>
			)}

			{isBusinessProfileVisible && (
				<BusinessProfile
					onHide={() => setBusinessProfileVisible(false)}
					displayEditBusinessProfile={displayEditBusinessProfile}
				/>
			)}

			{isUploadingMedia && !isMobileOnly && <UploadMediaIndicator />}

			{hasFailedMessages && (
				<RetryFailedMessages
					isSendingPendingMessages={isSendingPendingMessages}
					contactProvidersData={contactProvidersData}
					chats={chats}
				/>
			)}

			<BulkSendIndicator />

			<Menu
				anchorEl={anchorEl}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				open={Boolean(anchorEl)}
				onClose={hideMenu}
				elevation={3}
			>
				<MenuItem
					className="sidebar__menu__refresh"
					onClick={() => window.location.reload()}
				>
					{t('Refresh')}
				</MenuItem>
				{!isReadOnly && (
					<MenuItem onClick={showChangePassword}>
						<ListItemIcon>
							<PasswordIcon />
						</ListItemIcon>
						{t('Change password')}
					</MenuItem>
				)}
				<MenuItem onClick={forceClearContactProvidersData}>
					<ListItemIcon>
						<CloudSyncIcon />
					</ListItemIcon>
					{t('Refresh contacts')}
				</MenuItem>
				{/*<Divider />
				<MenuItem onClick={exportChats}>
					<ListItemIcon>
						<FileDownloadIcon />
					</ListItemIcon>
					{t('Export chats')}
				</MenuItem>*/}
				{currentUser?.isAdmin && <Divider />}
				{currentUser?.isAdmin && (
					<MenuItem
						component={Link}
						href={getHubURL(config?.API_BASE_URL ?? '')}
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
