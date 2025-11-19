import React, {
	MouseEvent,
	useEffect,
	useLayoutEffect,
	useContext,
	useMemo,
	useRef,
	useState,
} from 'react';
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
	EVENT_TOPIC_FORCE_REFRESH_CHAT_LIST,
	EVENT_TOPIC_GO_TO_MSG_ID,
	EVENT_TOPIC_NEW_CHAT_MESSAGES,
	EVENT_TOPIC_UPDATE_PERSON_NAME,
} from '@src/Constants';
import { useNavigate, useParams } from 'react-router-dom';
import SearchBar from '../../SearchBar';
import SidebarContactResult from './SidebarContactResult';
import NewMessageModel from '../../../api/models/NewMessageModel';
import PubSub from 'pubsub-js';
import BusinessProfile from './BusinessProfile';
import ChangePasswordDialog from '../../ChangePasswordDialog';
import SearchMessageResult from '../../SearchMessageResult/SearchMessageResult';
import { isMobile, isMobileOnly } from 'react-device-detect';
import ChatIcon from '@mui/icons-material/Chat';
import StartChat from '../../StartChat';
import { clearContactProvidersData } from '@src/helpers/StorageHelper';
import SelectableChatTag from '../../SelectableChatTag';
import { clearUserSession } from '@src/helpers/ApiHelper';
import Notifications from './Notifications';
import {
	Notifications as NotificationsIcon,
	QrCode,
} from '@mui/icons-material';
import { getObjLength } from '@src/helpers/ObjectHelper';
import { getHubURL } from '@src/helpers/URLHelper';
import RetryFailedMessages from './RetryFailedMessages';
import UploadMediaIndicator from './UploadMediaIndicator';
import { Trans, useTranslation } from 'react-i18next';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import {
	filterChat,
	handleChatAssignmentEvent,
} from '@src/helpers/SidebarHelper';
import { setCurrentUser } from '@src/store/reducers/currentUserReducer';
import { setTemplates } from '@src/store/reducers/templatesReducer';
import { setFilterTagId } from '@src/store/reducers/filterTagIdReducer';
import { setChatsCount } from '@src/store/reducers/chatsCountReducer';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import SellIcon from '@mui/icons-material/Sell';
import { AxiosError } from 'axios';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import { addChats, setChats } from '@src/store/reducers/chatsReducer';
import PasswordIcon from '@mui/icons-material/Password';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import DateRangeIcon from '@mui/icons-material/DateRange';
import SettingsIcon from '@mui/icons-material/Settings';
import FilterOption from '@src/components/FilterOption';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import FilterListIcon from '@mui/icons-material/FilterList';
import DateRangeDialog from '@src/components/DateRangeDialog';
import {
	convertDateToUnixTimestamp,
	formatDateRangeFilters,
} from '@src/helpers/DateHelper';
import useChatFilters from '@src/components/Main/Sidebar/useChatFilters';
import { ViewportList } from 'react-viewport-list';
import UserProfile from '@src/components/UserProfile';
import {
	setExportChat,
	setSelectionModeEnabled,
	setState,
} from '@src/store/reducers/UIReducer';
import ExportChatActions from '@src/components/Main/Sidebar/ExportChatActions';
import {
	mergeNewMessages,
	setNewMessages,
} from '@src/store/reducers/newMessagesReducer';
import { isUserInGroup } from '@src/helpers/UserHelper';
import { Tag } from '@src/types/tags';
import { Group } from '@src/types/groups';
import { fetchChat, fetchChats } from '@src/api/chatsApi';
import { PaginatedResponse } from '@src/types/common';
import { Chat, ChatList } from '@src/types/chats';
import {
	getChatContactName,
	getLastIncomingMessageTimestamp,
	getLastMessageTimestamp,
	setChatContactName,
} from '@src/helpers/ChatHelper';
import {
	getMessageTimestamp,
	getSenderName,
	prepareMessageList,
} from '@src/helpers/MessageHelper';
import { Message } from '@src/types/messages';
import { fetchMessages } from '@src/api/messagesApi';
import * as Styled from './Sidebar.styles';
import { PersonList } from '@src/types/persons';
import { store } from '@src/store';
import useSettings from '@src/hooks/useSettings';
import WebSocketConnectionIndicator from '@src/components/WebSocketConnectionIndicator';
import OpenInWhatsAppDialog from '@src/components/OpenInWhatsAppDialog';
import { fetchWhatsAppAccounts } from '@src/api/whatsAppAccountsApi';
import { setPhoneNumber } from '@src/store/reducers/phoneNumberReducer';
import UserAvailability from '@src/components/UserAvailability';

const CHAT_LIST_SCROLL_OFFSET = 2000;

interface Props {
	isLoaded: boolean;
	displayNotification: (title: string, body: string, chatWaId: string) => void;
	contactProvidersData: {
		[key: string]: any;
	};
	isChatOnly: boolean;
	setChatTagsListVisible: (value: boolean) => void;
}

const Sidebar: React.FC<Props> = ({
	isLoaded,
	displayNotification,
	contactProvidersData,
	isChatOnly,
	setChatTagsListVisible,
}) => {
	const config = useContext(AppConfigContext);

	const {
		hasFailedMessages,
		isBlurred,
		isSendingPendingMessages,
		isUploadingMedia,
		isReadOnly,
		selectedTags,
		selectedChats,
		isSelectionModeEnabled,
		isExportChat,
		isBrowserOffline,
		isWebSocketDisconnected,
	} = useAppSelector((state) => state.UI);
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const chats = useAppSelector((state) => state.chats.value);
	const chatsCount = useAppSelector((state) => state.chatsCount.value);
	const tags = useAppSelector((state) => state.tags.value);
	const groups = useAppSelector((state) => state.groups.value);
	const newMessages = useAppSelector((state) => state.newMessages.value);

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

	const { handleCheckSettingsRefreshStatus, profilePhoto } = useSettings();

	const chatListRef = useRef<HTMLDivElement | null>(null);
	const prevOffsetRef = useRef<number>(0);

	const filteredChats = useMemo(() => {
		// Calculating and storing previous offset top of chat list
		const anchorEl = chatListRef.current;
		const container = chatListRef.current;

		if (anchorEl && container) {
			const containerScrollTop = container.scrollTop;
			const anchorOffsetTop = anchorEl.offsetTop;
			prevOffsetRef.current = anchorOffsetTop - containerScrollTop;
		}

		return Object.values(chats).filter((chat) => {
			// Filter by helper method
			return filterChat(
				currentUser,
				chat,
				filterTagId,
				filterAssignedToMe,
				filterAssignedGroupId
			);
		});
	}, [
		chats,
		currentUser,
		filterTagId,
		filterAssignedToMe,
		filterAssignedGroupId,
	]);

	useLayoutEffect(() => {
		const anchorEl = chatListRef.current;
		const container = chatListRef.current;

		if (anchorEl && container) {
			const newOffsetTop = anchorEl.offsetTop;
			container.scrollTop = newOffsetTop - prevOffsetRef.current;
		}
	}, [filteredChats]);

	const filteredChatsCount = useMemo(
		() => getObjLength(filteredChats),
		[filteredChats]
	);

	const [searchedKeyword, setSearchedKeyword] = useState('');
	const [chatMessages, setChatMessages] = useState<ChatMessageList>({});
	const [contactResults, setContactResults] = useState<PersonList>({});
	const [isBusinessProfileVisible, setBusinessProfileVisible] = useState(false);
	const [isUserProfileVisible, setUserProfileVisible] = useState(false);
	const [isContactsVisible, setContactsVisible] = useState(false);
	const [isChangePasswordDialogVisible, setChangePasswordDialogVisible] =
		useState(false);
	const [isOpenInWhatsAppDialogVisible, setOpenInWhatsAppDialogVisible] =
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

	const [originalDocumentTitle, setOriginalDocumentTitle] = useState('');

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

	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		setOriginalDocumentTitle(document.title);

		return () => {
			document.title = originalDocumentTitle;
		};
	}, []);

	useEffect(() => {
		if (isLoaded) {
			doFetchWhatsAppAccounts();
		}
	}, [isLoaded]);

	useEffect(() => {
		// Trigger loading indicator
		setLoadingChats(true);

		// Generate an abort controller
		abortControllerRef.current = new AbortController();

		timer.current = setTimeout(() => {
			listChats(true, chatsOffset, true);

			if (keyword.trim().length > 0) {
				searchMessages();
			}

			setSearchedKeyword(keyword);
		}, 500);

		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort(
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
		const onForceRefreshChatList = function (msg: string, data: any) {
			// Force refresh chat list
			listChats(false, undefined, true);
		};

		const forceRefreshChatListEventToken = PubSub.subscribe(
			EVENT_TOPIC_FORCE_REFRESH_CHAT_LIST,
			onForceRefreshChatList
		);

		return () => {
			PubSub.unsubscribe(forceRefreshChatListEventToken);
		};
	}, [waId]);

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
					const chatMessageWaId = chatMessage.customer_wa_id;

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
						nextState[chatKey] = {
							...nextState[chatKey],
							last_message: chatMessage,
						};

						// Update last incoming message timestamp
						if (!chatMessage.from_us && nextState[chatKey].contact) {
							// Make data mutable
							nextState[chatKey].contact = { ...nextState[chatKey].contact };
							nextState[chatKey].contact.last_message_timestamp =
								getMessageTimestamp(chatMessage) ?? -1;
						}

						// Incoming
						if (!chatMessage.from_us) {
							// Update name and initials on incoming message if name is missing
							const chat = nextState[chatKey];
							if (chat) {
								const chatName = getChatContactName(chat);
								if (!containsLetters(chatName)) {
									// Update sidebar chat name
									const updatedChat = setChatContactName(
										nextState[chatKey],
										getSenderName(chatMessage)
									);

									if (updatedChat) {
										nextState[chatKey] = updatedChat;
									}

									// Check if current chat
									if (waId === chatMessageWaId) {
										PubSub.publish(
											EVENT_TOPIC_UPDATE_PERSON_NAME,
											getSenderName(chatMessage)
										);
									}
								}
							}
						}
					}

					// New chatMessages
					if (
						!chatMessage.from_us &&
						(waId !== chatMessageWaId ||
							document.visibilityState === 'hidden' ||
							isBlurred)
					) {
						const preparedNewMessages = { ...newMessages };
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

						dispatch(setNewMessages({ ...preparedNewMessages }));

						// Display a notification
						if (chatMessageWaId && !chatMessage.from_us) {
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
						listChats(false, getObjLength(chats), false);
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
				(getLastIncomingMessageTimestamp(b[1]) ??
					getLastMessageTimestamp(b[1]) ??
					0) -
				(getLastIncomingMessageTimestamp(a[1]) ??
					getLastMessageTimestamp(a[1]) ??
					0)
		);
		return Object.fromEntries(sortedState);
	};

	const listChats = async (
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

		try {
			const data = await fetchChats(
				{
					search: keyword,
					chat_tag_id: filterTagId,
					limit: chatsLimit,
					offset,
					assigned_to_me: filterAssignedToMe ? true : undefined,
					assigned_group: filterAssignedGroupId,
					messages_before_time: messageBeforeTime,
					messages_since_time: messagesSinceTime,
				},
				dynamicFilters,
				abortControllerRef.current?.signal
			);
			processChatsData(data, isInitial, replaceAll);
		} catch (error: any | AxiosError) {
			console.error(error);
			setLoadingMoreChats(false);
			setLoadingChats(false);
			if (isInitial) {
				dispatch(setState({ isInitialResourceFailed: true }));
			}
		}
	};

	const processChatsData = (
		data: PaginatedResponse<Chat>,
		isInitial: boolean,
		replaceAll: boolean
	) => {
		dispatch(setChatsCount(data.count));

		const chatList: ChatList = {};
		data.results.forEach(
			(item) => (chatList[CHAT_KEY_PREFIX + item.wa_id] = item)
		);

		// Store
		if (replaceAll) {
			dispatch(setChats(chatList));
		} else {
			dispatch(addChats(chatList));
		}

		if (isInitial) {
			dispatch(setState({ loadingProgress: 100 }));
		}

		const willNotify = !isInitial;

		const preparedNewMessages: { [key: string]: NewMessageModel } = {};
		data.results.forEach((newMessage: any) => {
			const newWaId = newMessage.contact.waba_payload.wa_id;
			const newAmount = newMessage.new_messages;
			const prepared = new NewMessageModel(newWaId, newAmount);
			preparedNewMessages[prepared.waId] = prepared;
		});

		if (willNotify) {
			let hasAnyNewMessages = false;
			let chatMessageWaId: string | undefined;

			// Get the latest data directly as a workaround
			const prevState = { ...store.getState().newMessages.value };

			// Update new messages
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
						if (chatMessageWaId === newMsgWaId) chatMessageWaId = newMsgWaId;
					}
				}
			});

			// When state is a JSON object, it is unable to understand whether it is different or same and renders again
			// So we check if new state is actually different from previous state
			dispatch(mergeNewMessages(preparedNewMessages));

			// Display a notification
			if (chatMessageWaId && hasAnyNewMessages) {
				displayNotification(
					t('New messages'),
					t('You have new messages!'),
					chatMessageWaId
				);
			}
		} else {
			dispatch(setNewMessages({ ...newMessages, ...preparedNewMessages }));
		}

		setLoadingMoreChats(false);
		setLoadingChats(false);
	};

	const retrieveChat = async (chatWaId: string) => {
		try {
			const data = await fetchChat(chatWaId);
			// Remove this chat from missing chats list
			setMissingChats((prevState) =>
				prevState.filter((item) => item !== chatWaId)
			);

			// Don't display chat if tab case is "me" and chat is not assigned to user
			if (filterAssignedToMe) {
				if (
					!data.assigned_to_user ||
					data.assigned_to_user.id !== currentUser?.id
				) {
					console.log(
						'Chat will not be displayed as it does not belong to current tab.'
					);
					return;
				}
			} else if (filterAssignedGroupId) {
				if (
					!data.assigned_group ||
					isUserInGroup(currentUser, data.assigned_group.id)
				) {
					console.log(
						'Chat will not be displayed as it does not belong to current tab.'
					);
					return;
				}
			}

			const prevState: ChatList = { ...chats };
			prevState[CHAT_KEY_PREFIX + chatWaId] = data;
			const sortedNextState = sortChats(prevState);

			dispatch(setChats({ ...sortedNextState }));
		} catch (error) {
			console.error(error);
		}
	};

	const doFetchWhatsAppAccounts = async () => {
		try {
			const data = await fetchWhatsAppAccounts(true);
			const phoneNumber = data.results[0]?.phone_number;

			if (phoneNumber) {
				dispatch(setPhoneNumber(phoneNumber));

				document.title = `+${phoneNumber} - ${document.title}`;
			}
		} catch (error) {
			console.error(error);
		}
	};

	const searchMessages = async () => {
		// Convert dates to Unix timestamps
		const messagesSinceTime = filterStartDate
			? convertDateToUnixTimestamp(filterStartDate)
			: undefined;
		const messageBeforeTime = filterEndDate
			? convertDateToUnixTimestamp(filterEndDate)
			: undefined;

		try {
			const data = await fetchMessages(
				{
					search: keyword,
					chat_tag_id: filterTagId,
					limit: 30,
					assigned_to_me: filterAssignedToMe ? true : undefined,
					assigned_group: filterAssignedGroupId,
					before_time: messageBeforeTime,
					since_time: messagesSinceTime,
				},
				abortControllerRef.current?.signal
			);
			const preparedMessages = prepareMessageList(data.results);
			setChatMessages(preparedMessages);
		} catch (error) {
			console.error(error);
		}
	};

	const goToMessage = (chatMessage: Message) => {
		if (waId !== chatMessage.customer_wa_id) {
			navigate(`/main/chat/${chatMessage.customer_wa_id}`, {
				state: {
					goToMessage: {
						id: chatMessage.id,
						timestamp: getMessageTimestamp(chatMessage),
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
		if (window.AndroidWebInterface) {
			window.AndroidWebInterface.goToSettings();
		}
	};

	const showChangePassword = () => {
		setAnchorEl(null);
		setChangePasswordDialogVisible(true);
	};

	const showOpenInWhatsApp = () => {
		setAnchorEl(null);
		setOpenInWhatsAppDialogVisible(true);
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
		<Styled.Sidebar $isHidden={isChatOnly}>
			<Styled.Header>
				<Styled.SessionContainer>
					<Tooltip title={t('Business Profile')} disableInteractive>
						<div>
							<Styled.BusinessAvatar
								onClick={() => setBusinessProfileVisible(true)}
								profilePhoto={profilePhoto}
							/>
						</div>
					</Tooltip>
					<Tooltip title={currentUser?.username} disableInteractive>
						<div>
							<Styled.UserAvatar
								generateBgColorBy={currentUser?.username}
								onClick={() => setUserProfileVisible(true)}
							>
								{currentUser
									? generateInitialsHelper(currentUser?.username)
									: ''}
							</Styled.UserAvatar>
						</div>
					</Tooltip>
				</Styled.SessionContainer>

				<Styled.HeaderRight>
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
				</Styled.HeaderRight>
			</Styled.Header>

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

			{(isWebSocketDisconnected || isBrowserOffline) && (
				<WebSocketConnectionIndicator />
			)}

			<ClickAwayListener
				onClickAway={() => {
					if (!keyword && !isAnyActiveFilter && isLoaded) {
						setFiltersVisible(false);
					}
				}}
			>
				<Styled.SearchOrFilterGroup $isExpanded={isForceDisplayFilters}>
					<Collapse in={Boolean(isAnyActiveFilter || keyword)}>
						<Styled.FilterGroup $isActive={true}>
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
						</Styled.FilterGroup>
					</Collapse>

					<SearchBar
						value={keyword}
						onChange={(_keyword) => search(_keyword)}
						placeholder={t('Search, filter by tags, time, etc.')}
						onFocus={() => setFiltersVisible(true)}
					/>

					<Collapse in={isForceDisplayFilters}>
						<>
							<Styled.FilterGroup $isAll={true}>
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
							</Styled.FilterGroup>

							{(keyword || isAnyActiveFilter) && (
								<Styled.ChatsCount>
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
								</Styled.ChatsCount>
							)}
						</>
					</Collapse>

					<Menu
						anchorEl={tagsMenuAnchorEl}
						open={Boolean(tagsMenuAnchorEl)}
						onClose={() => setTagsMenuAnchorEl(undefined)}
						elevation={3}
					>
						{tags &&
							tags.slice(0, 10).map((tag: Tag) => (
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
												fill: tag.web_inbox_color,
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
								.map((group: Group) => (
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
				</Styled.SearchOrFilterGroup>
			</ClickAwayListener>

			<UserAvailability />

			<Styled.ResultsContainer>
				{isSelectionModeEnabled && (
					<>
						{tags && (
							<>
								<h3>{t('Tags')}</h3>
								<div>
									{tags.map((tag) => (
										<SelectableChatTag key={tag.id} data={tag} />
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
						<Styled.NoResults>
							<span>{t("You don't have any chats yet.")}</span>
						</Styled.NoResults>
					)}

				{filteredChatsCount > 0 && (
					<Styled.ChatList
						$isUnpacked={
							searchedKeyword.trim().length > 0 || isSelectionModeEnabled
						}
						ref={chatListRef}
					>
						<ViewportList
							viewportRef={chatListRef}
							items={filteredChats}
							overscan={5}
						>
							{(item) => (
								<ChatListItem
									key={item.wa_id}
									chatData={item}
									keyword={searchedKeyword}
									contactProvidersData={contactProvidersData}
									filterAssignedToMe={filterAssignedToMe}
									filterAssignedGroupId={filterAssignedGroupId}
								/>
							)}
						</ViewportList>
					</Styled.ChatList>
				)}

				{searchedKeyword.trim().length > 0 &&
					getObjLength(contactResults) > 0 && (
						<>
							<h3>{t('Contacts')}</h3>
							<div>
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
							<Styled.MessageList>
								{Object.entries(chatMessages).map((message) => (
									<SearchMessageResult
										key={message[0]}
										messageData={message[1]}
										keyword={searchedKeyword}
										displaySender={true}
										onClick={(chatMessage: Message) => goToMessage(chatMessage)}
									/>
								))}
							</Styled.MessageList>
						</>
					)}
			</Styled.ResultsContainer>

			<Fade in={isLoadingMoreChats} unmountOnExit>
				<Styled.LoadingMore>
					<Zoom in={isLoadingMoreChats}>
						<Styled.LoadingMoreWrapper>
							<CircularProgress size={28} />
						</Styled.LoadingMoreWrapper>
					</Zoom>
				</Styled.LoadingMore>
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
					handleCheckSettingsRefreshStatus={handleCheckSettingsRefreshStatus}
					profilePhoto={profilePhoto}
					showOpenInWhatsApp={showOpenInWhatsApp}
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

			<Menu
				anchorEl={anchorEl}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				open={Boolean(anchorEl)}
				onClose={hideMenu}
				elevation={3}
			>
				<Styled.RefreshMenuItem onClick={() => window.location.reload()}>
					{t('Refresh')}
				</Styled.RefreshMenuItem>
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
				<Divider />
				<MenuItem onClick={showOpenInWhatsApp}>
					<ListItemIcon>
						<QrCode />
					</ListItemIcon>
					{t('Open in WhatsApp')}
				</MenuItem>
				{/*<Divider />
				<MenuItem onClick={exportChats}>
					<ListItemIcon>
						<FileDownloadIcon />
					</ListItemIcon>
					{t('Export chats')}
				</MenuItem>*/}
				{currentUser?.profile?.role === 'admin' && <Divider />}
				{currentUser?.profile?.role === 'admin' && (
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

			<ChangePasswordDialog
				open={isChangePasswordDialogVisible}
				setOpen={setChangePasswordDialogVisible}
			/>

			<OpenInWhatsAppDialog
				open={isOpenInWhatsAppDialogVisible}
				setOpen={setOpenInWhatsAppDialogVisible}
				profilePhoto={profilePhoto}
			/>

			{isNotificationsVisible && (
				<Notifications onHide={() => setNotificationsVisible(false)} />
			)}
		</Styled.Sidebar>
	);
};

export default Sidebar;
