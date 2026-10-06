import React, {
	useEffect,
	useLayoutEffect,
	useContext,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Button } from '@src/components/ui/button';
import { ClickAwayListener } from '@src/components/ui/click-away-listener';
import {
	Collapsible,
	CollapsibleContent,
} from '@src/components/ui/collapsible';
import {
	AnchoredDropdownMenu,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@src/components/ui/dropdown-menu';
import { Spinner } from '@src/components/ui/spinner';
import LoadingMoreIndicator from '@src/components/LoadingMoreIndicator';
import { SimpleTooltip } from '@src/components/ui/tooltip';
import MoreVertIcon from '@src/components/icons/MoreVert';
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
import CreateUserDialog from '@src/components/CreateUserDialog';
import SearchMessageResult from '../../SearchMessageResult/SearchMessageResult';
import { isMobile, isMobileOnly } from 'react-device-detect';
import ChatIcon from '@src/components/icons/Chat';
import StartChat from '../../StartChat';
import useUnmountTransition from '@src/hooks/useUnmountTransition';
import { clearContactProvidersData } from '@src/helpers/StorageHelper';
import SelectableChatTag from '../../SelectableChatTag';
import { clearUserSession } from '@src/helpers/ApiHelper';
import Notifications from './Notifications';
import {
	BarChart as BarChartIcon,
	Notifications as NotificationsIcon,
	QrCode,
} from '@src/components/icons';
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
import { useIsUserActionsRestricted } from '@src/hooks/useIsUserActionsRestricted';
import { setCurrentUser } from '@src/store/reducers/currentUserReducer';
import { setTemplates } from '@src/store/reducers/templatesReducer';
import { setFilterTagId } from '@src/store/reducers/filterTagIdReducer';
import { setChatsCount } from '@src/store/reducers/chatsCountReducer';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import SellIcon from '@src/components/icons/Sell';
import { AxiosError } from 'axios';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import { addChats, setChats } from '@src/store/reducers/chatsReducer';
import PasswordIcon from '@src/components/icons/Password';
import CloudSyncIcon from '@src/components/icons/CloudSync';
import AdminPanelSettingsIcon from '@src/components/icons/AdminPanelSettings';
import PersonAddAltIcon from '@src/components/icons/PersonAdd';
import LogoutIcon from '@src/components/icons/Logout';
import UnfoldMoreIcon from '@src/components/icons/UnfoldMore';
import DateRangeIcon from '@src/components/icons/DateRange';
import SettingsIcon from '@src/components/icons/Settings';
import FilterOption from '@src/components/FilterOption';
import PersonIcon from '@src/components/icons/Person';
import GroupIcon from '@src/components/icons/Group';
import FilterListIcon from '@src/components/icons/FilterList';
import MarkChatUnreadIcon from '@src/components/icons/MarkChatUnread';
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
import { mergeMessagingWindow } from '@src/helpers/PersonHelper';
import { getChatPath } from '@src/helpers/RouteHelper';
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
import { cn } from '@src/lib/utils';
import BusinessProfileAvatar from '@src/components/BusinessProfileAvatar';
import CustomAvatar from '@src/components/CustomAvatar';
import { PersonList } from '@src/types/persons';
import { store } from '@src/store';
import useSettings from '@src/hooks/useSettings';
import WebSocketConnectionIndicator from '@src/components/WebSocketConnectionIndicator';
import OpenInWhatsAppDialog from '@src/components/OpenInWhatsAppDialog';
import { fetchWhatsAppAccounts } from '@src/api/whatsAppAccountsApi';
import { setPhoneNumber } from '@src/store/reducers/phoneNumberReducer';
import UserAvailability from '@src/components/UserAvailability';
import UserListView from '@src/components/UserListView';
import { updateUserAvailability } from '@src/api/usersApi';
import { logout } from '@src/api/authApi';

const CHAT_LIST_SCROLL_OFFSET = 2000;

/** Heading of a group in the results list (Tags, Chats, Contacts, Messages) */
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => <h3 className="px-3.75 py-2.5 font-normal text-primary">{children}</h3>;

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
	const isUserActionsRestricted = useIsUserActionsRestricted();
	const isUserAvailable = useAppSelector(
		(state) => state.isUserAvailable.value
	);
	const isUserAvailabilityFeatureEnabled = useAppSelector(
		(state) => state.isUserAvailabilityFeatureEnabled.value
	);
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
		filterUnread,
		setFilterUnread,
	} = useChatFilters();

	const { waId } = useParams();
	const [isMenuVisible, setMenuVisible] = useState(false);

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
				newMessages,
				filterTagId,
				filterAssignedToMe,
				filterAssignedGroupId,
				filterUnread
			);
		});
	}, [
		chats,
		currentUser,
		newMessages,
		filterTagId,
		filterAssignedToMe,
		filterAssignedGroupId,
		filterUnread,
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
	const [isCreateUserDialogVisible, setCreateUserDialogVisible] =
		useState(false);
	const [isNotificationsVisible, setNotificationsVisible] = useState(false);
	const [isUserListVisible, setUserListVisible] = useState(false);
	const contactsTransition = useUnmountTransition(isContactsVisible);
	const userProfileTransition = useUnmountTransition(isUserProfileVisible);
	const businessProfileTransition = useUnmountTransition(
		isBusinessProfileVisible
	);
	const notificationsTransition = useUnmountTransition(isNotificationsVisible);
	const userListTransition = useUnmountTransition(isUserListVisible);
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

	const logOut = async () => {
		// Set as unavailable on logout
		if (isUserAvailabilityFeatureEnabled && isUserAvailable && !!currentUser) {
			try {
				await updateUserAvailability(currentUser.id, { is_available: false });
			} catch (error: any | AxiosError) {
				console.error(error);
			}
		}

		// Clear the backend session too, not just the local token. Otherwise a
		// stale session lingers: the login page then shows "Continue as" and,
		// on a "Login with 360dialog" retry, takes the sso_switch path (which
		// depends on 360dialog's currently broken authx logout) instead of a
		// clean login. Best effort — ignored if there is no session to clear.
		try {
			await logout();
		} catch (error: any | AxiosError) {
			console.error(error);
		}

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
		setMenuVisible(false);
		dispatch(setSelectionModeEnabled(true));
		dispatch(setExportChat(true));
	};

	const hideMenu = () => {
		setMenuVisible(false);
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
		filterUnread,
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
							// Make data mutable, and take over the messaging window the
							// backend recomputed for this message, so the countdown and the
							// expired styling stay right without re-fetching the chat
							nextState[chatKey].contact = mergeMessagingWindow(
								{ ...nextState[chatKey].contact },
								chatMessage.contact
							);
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
							const cloned = { ...preparedNewMessages[chatMessageWaId] };
							cloned.newMessages++;
							preparedNewMessages[chatMessageWaId] = cloned;
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
					unread: filterUnread ? true : undefined,
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
			navigate(getChatPath(chatMessage.customer_wa_id), {
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
		setMenuVisible(false);
		setBusinessProfileVisible(true);
	};

	const goToSettings = () => {
		setMenuVisible(false);
		if (window.AndroidWebInterface) {
			window.AndroidWebInterface.goToSettings();
		}
	};

	const showChangePassword = () => {
		setMenuVisible(false);
		setChangePasswordDialogVisible(true);
	};

	const showCreateUser = () => {
		setMenuVisible(false);
		setCreateUserDialogVisible(true);
	};

	const showOpenInWhatsApp = () => {
		setMenuVisible(false);
		setOpenInWhatsAppDialogVisible(true);
	};

	// The notifications panel covers the options button, so the closing menu
	// mustn't give the focus back to it (that would show its tooltip on top)
	const isOpeningNotifications = useRef(false);

	const showNotifications = () => {
		isOpeningNotifications.current = true;
		setMenuVisible(false);
		setNotificationsVisible(true);
	};

	const showChatTagsList = () => {
		setMenuVisible(false);
		setChatTagsListVisible(true);
	};

	const displayContacts = () => {
		setContactsVisible(true);
	};

	const cancelSelection = () => {
		dispatch(setSelectionModeEnabled(false));
		dispatch(setState({ selectedTags: [], selectedChats: [] }));
	};

	const displayUserList = () => {
		setUserListVisible(true);
	};

	const isAnyActiveFilter = Boolean(
		getObjLength(dynamicFilters) > 0 ||
			filterAssignedToMe ||
			filterAssignedGroupId ||
			filterTagId ||
			filterStartDate ||
			filterUnread
	);
	const isForceDisplayFilters = isFiltersVisible || isAnyActiveFilter;
	const activeFilterTag = tags?.find((item) => item.id === filterTagId);

	return (
		<div
			className={cn(
				'relative flex flex-[0.3] flex-col max-lg:flex-[0.4] max-md:absolute max-md:inset-0',
				isChatOnly && 'hidden'
			)}
		>
			<div className="flex h-(--header-height) items-center justify-between bg-gray-light px-3.75 py-1 max-md:px-2.5">
				<div className="relative flex">
					<SimpleTooltip title={t('Business Profile')} disableHoverableContent>
						<div>
							<BusinessProfileAvatar
								className="cursor-pointer"
								onClick={() => setBusinessProfileVisible(true)}
								profilePhoto={profilePhoto}
							/>
						</div>
					</SimpleTooltip>
					<SimpleTooltip title={currentUser?.username} disableHoverableContent>
						<div>
							<CustomAvatar
								className="-ml-3 cursor-pointer outline outline-gray-light"
								generateBgColorBy={currentUser?.username}
								onClick={() => setUserProfileVisible(true)}
							>
								{currentUser
									? generateInitialsHelper(currentUser?.username)
									: ''}
							</CustomAvatar>
						</div>
					</SimpleTooltip>
				</div>

				<div className="flex items-center justify-between">
					{!isReadOnly && !isUserActionsRestricted && (
						<SimpleTooltip title={t('New chat')} disableHoverableContent>
							<Button
								variant="ghost"
								color="neutral"
								size="icon-xl"
								onClick={displayContacts}
								data-test-id="new-chat"
							>
								<ChatIcon />
							</Button>
						</SimpleTooltip>
					)}
					<SimpleTooltip title={t('Users')} disableHoverableContent>
						<Button
							variant="ghost"
							color="neutral"
							size="icon-xl"
							onClick={displayUserList}
						>
							<GroupIcon />
						</Button>
					</SimpleTooltip>
					{/* The analytics API is for admins only */}
					{currentUser?.profile?.role === 'admin' && (
						<SimpleTooltip title={t('Analytics')} disableHoverableContent>
							<Button
								variant="ghost"
								color="neutral"
								size="icon-xl"
								onClick={() => dispatch(setState({ isAnalyticsVisible: true }))}
							>
								<BarChartIcon />
							</Button>
						</SimpleTooltip>
					)}
					{currentUser?.profile?.role === 'admin' && (
						<SimpleTooltip title={t('Admin panel')} disableHoverableContent>
							{/* Hidden where the header runs out of room; the options menu
							    has an Admin panel entry too */}
							<Button
								asChild
								className="max-lg:hidden"
								variant="ghost"
								color="neutral"
								size="icon-xl"
							>
								<a href={getHubURL(config?.API_BASE_URL ?? '')} target="_blank">
									<AdminPanelSettingsIcon />
								</a>
							</Button>
						</SimpleTooltip>
					)}
					<DropdownMenu open={isMenuVisible} onOpenChange={setMenuVisible}>
						<SimpleTooltip title={t('Options')} disableHoverableContent>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									color="neutral"
									size="icon-xl"
									data-test-id="options"
								>
									<MoreVertIcon />
								</Button>
							</DropdownMenuTrigger>
						</SimpleTooltip>
						<DropdownMenuContent
							align="end"
							onCloseAutoFocus={(event) => {
								if (isOpeningNotifications.current) {
									isOpeningNotifications.current = false;
									event.preventDefault();
								}
							}}
						>
							{/* Phones only: there is no browser reload button there */}
							<DropdownMenuItem
								className="md:hidden"
								onSelect={() => window.location.reload()}
							>
								{t('Refresh')}
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={showNotifications}>
								<NotificationsIcon />
								{t('Notifications')}
							</DropdownMenuItem>
							{!isReadOnly && (
								<DropdownMenuItem onSelect={showChangePassword}>
									<PasswordIcon />
									{t('Change password')}
								</DropdownMenuItem>
							)}
							<DropdownMenuItem onSelect={forceClearContactProvidersData}>
								<CloudSyncIcon />
								{t('Refresh contacts')}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onSelect={showOpenInWhatsApp}>
								<QrCode />
								{t('Open in WhatsApp')}
							</DropdownMenuItem>
							{/*<DropdownMenuSeparator />
							<DropdownMenuItem onSelect={exportChats}>
								<FileDownloadIcon />
								{t('Export chats')}
							</DropdownMenuItem>*/}
							{currentUser?.profile?.role === 'admin' && (
								<DropdownMenuSeparator />
							)}
							{currentUser?.profile?.role === 'admin' && !isReadOnly && (
								<DropdownMenuItem
									onSelect={showCreateUser}
									data-test-id="create-user-button"
								>
									<PersonAddAltIcon />
									{t('Create new user')}
								</DropdownMenuItem>
							)}
							{currentUser?.profile?.role === 'admin' && (
								<DropdownMenuItem asChild>
									<a
										href={getHubURL(config?.API_BASE_URL ?? '')}
										target="_blank"
									>
										<AdminPanelSettingsIcon />
										{t('Admin panel')}
									</a>
								</DropdownMenuItem>
							)}
							{isMobile && (
								<DropdownMenuItem onSelect={goToSettings}>
									{t('Settings (App Only)')}
								</DropdownMenuItem>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem onSelect={logOut} data-test-id="logout-button">
								<LogoutIcon />
								{t('Logout')}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

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
				<div
					className={cn(
						'py-2.5 transition-[background-color] duration-200 ease-in',
						isForceDisplayFilters ? 'bg-gray-light' : 'bg-white'
					)}
				>
					<SearchBar
						value={keyword}
						onChange={(_keyword) => search(_keyword)}
						placeholder={t('Search, filter by tags, time, etc.')}
						onFocus={() => setFiltersVisible(true)}
						isFocusStyleEnabled={false}
						className="bg-transparent py-0"
						// White like the filter chips once the area turns grey
						fieldClassName={cn(isForceDisplayFilters && 'bg-white shadow-sm')}
					/>

					<Collapsible open={isForceDisplayFilters}>
						<CollapsibleContent>
							{/* One chip per filter, which turns mint while applied */}
							<div className="mt-2.5 flex flex-wrap gap-1.5 px-3.75">
								<FilterOption
									icon={<MarkChatUnreadIcon />}
									label={t('Unread')}
									isActive={filterUnread}
									onClick={() => setFilterUnread(!filterUnread)}
									onClear={() => setFilterUnread(false)}
								/>
								<FilterOption
									icon={<PersonIcon />}
									label={t('Assigned to me')}
									isActive={filterAssignedToMe}
									onClick={() => setFilterAssignedToMe(!filterAssignedToMe)}
									onClear={() => setFilterAssignedToMe(false)}
								/>
								<FilterOption
									icon={<GroupIcon />}
									label={
										filterAssignedGroupId
											? groups[filterAssignedGroupId]?.name ?? t('Unknown')
											: t('Assigned group')
									}
									isActive={Boolean(filterAssignedGroupId)}
									onClick={(event) =>
										setGroupsMenuAnchorEl(event.currentTarget)
									}
									onClear={() => setFilterAssignedGroupId(undefined)}
								/>
								{(tags?.length > 0 || Boolean(filterTagId)) && (
									<FilterOption
										icon={
											<SellIcon
												style={
													filterTagId
														? { fill: activeFilterTag?.web_inbox_color }
														: undefined
												}
											/>
										}
										label={
											filterTagId
												? activeFilterTag?.name ?? t('Unknown')
												: t('Tag')
										}
										isActive={Boolean(filterTagId)}
										onClick={(event) =>
											setTagsMenuAnchorEl(event.currentTarget)
										}
										onClear={() => dispatch(setFilterTagId(undefined))}
									/>
								)}
								<FilterOption
									icon={<DateRangeIcon />}
									label={
										filterStartDate
											? formatDateRangeFilters(filterStartDate, filterEndDate)
											: t('Time')
									}
									isActive={Boolean(filterStartDate)}
									onClick={() => setDateRangeDialogVisible(true)}
									onClear={() => {
										setFilterStartDate(undefined);
										setFilterEndDate(undefined);
									}}
								/>
								{/* Filters from the URL (cf_...), which have no chip of their own */}
								{Object.entries(dynamicFilters).map(([key, value]) => (
									<FilterOption
										key={key}
										icon={<FilterListIcon />}
										label={`${key.slice(CHAT_FILTER_PREFIX.length)}: ${value}`}
										isActive
										onClick={() => removeDynamicFilter(key)}
										onClear={() => removeDynamicFilter(key)}
									/>
								))}
							</div>

							{(keyword || isAnyActiveFilter) && (
								<div className="flex items-center px-3.75 pt-3.75 text-[12px] font-semibold text-ink/50">
									{isLoadingChats && (
										<Spinner size={14} className="-mt-px mr-2.5 text-primary" />
									)}
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
						</CollapsibleContent>
					</Collapsible>

					<AnchoredDropdownMenu
						anchorEl={tagsMenuAnchorEl}
						onClose={() => setTagsMenuAnchorEl(undefined)}
						align="start"
					>
						{tags &&
							tags.slice(0, 10).map((tag: Tag) => (
								<DropdownMenuItem
									onSelect={() => {
										dispatch(setFilterTagId(tag.id));
										setTagsMenuAnchorEl(undefined);
									}}
									key={tag.id}
								>
									<SellIcon
										style={{
											fill: tag.web_inbox_color,
										}}
									/>
									{tag.name}
								</DropdownMenuItem>
							))}
						<DropdownMenuSeparator />
						{tags && tags.length > 10 && (
							<DropdownMenuItem
								onSelect={() => {
									showChatTagsList();
									setTagsMenuAnchorEl(undefined);
								}}
							>
								<UnfoldMoreIcon />
								{t('More')}
							</DropdownMenuItem>
						)}
						<DropdownMenuItem asChild>
							<a
								href={getHubURL(config?.API_BASE_URL ?? '') + 'main/tag/'}
								target="_blank"
							>
								<SettingsIcon />
								{t('Manage tags')}
							</a>
						</DropdownMenuItem>
					</AnchoredDropdownMenu>

					<AnchoredDropdownMenu
						anchorEl={groupsMenuAnchorEl}
						onClose={() => setGroupsMenuAnchorEl(undefined)}
						align="start"
					>
						{groups &&
							Object.values(groups)
								.filter((item) =>
									currentUser?.groups?.some(
										(userGroup) => userGroup.id === item.id
									)
								)
								.map((group: Group) => (
									<DropdownMenuItem
										onSelect={() => {
											setFilterAssignedGroupId(group.id);
											setGroupsMenuAnchorEl(undefined);
										}}
										key={group.id}
									>
										{group.name}
									</DropdownMenuItem>
								))}
					</AnchoredDropdownMenu>

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

			{/* The list and its loading overlay, above the availability footer */}
			<div className="relative flex min-h-0 flex-1 flex-col">
				<div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white">
					{isSelectionModeEnabled && (
						<>
							{tags && (
								<>
									<SectionTitle>{t('Tags')}</SectionTitle>
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
						<SectionTitle>{t('Chats')}</SectionTitle>
					)}

					{!isLoadingChats &&
						searchedKeyword.trim().length === 0 &&
						!isAnyActiveFilter &&
						filteredChatsCount === 0 && (
							<span className="block px-3.75 py-2.5 text-[14px] [word-break:break-word] text-ink/60">
								<span>{t("You don't have any chats yet.")}</span>
							</span>
						)}

					{filteredChatsCount > 0 && (
						<div
							className={cn(
								'flex-1 overflow-y-auto',
								(searchedKeyword.trim().length > 0 || isSelectionModeEnabled) &&
									'flex-none overflow-y-hidden'
							)}
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
						</div>
					)}

					{searchedKeyword.trim().length > 0 &&
						getObjLength(contactResults) > 0 && (
							<>
								<SectionTitle>{t('Contacts')}</SectionTitle>
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
								<SectionTitle>{t('Messages')}</SectionTitle>
								<div>
									{Object.entries(chatMessages).map((message) => (
										<SearchMessageResult
											key={message[0]}
											messageData={message[1]}
											keyword={searchedKeyword}
											displaySender={true}
											onClick={(chatMessage: Message) =>
												goToMessage(chatMessage)
											}
										/>
									))}
								</div>
							</>
						)}
				</div>

				{isLoadingMoreChats && (
					<div className="absolute right-1.25 bottom-0 left-0 z-1 flex animate-fade-in justify-center bg-linear-to-t from-white to-white/0 pb-5">
						<LoadingMoreIndicator className="animate-in fade-in-0 zoom-in-95" />
					</div>
				)}
			</div>

			{/* Always at the bottom of the sidebar, below the list */}
			{isUserAvailabilityFeatureEnabled && <UserAvailability />}

			{contactsTransition.isMounted && (
				<StartChat
					onHide={() => setContactsVisible(false)}
					isExiting={contactsTransition.isExiting}
					onAnimationEnd={contactsTransition.handleAnimationEnd}
				/>
			)}

			{userProfileTransition.isMounted && (
				<UserProfile
					onHide={() => setUserProfileVisible(false)}
					setChangePasswordDialogVisible={setChangePasswordDialogVisible}
					isExiting={userProfileTransition.isExiting}
					onAnimationEnd={userProfileTransition.handleAnimationEnd}
				/>
			)}

			{businessProfileTransition.isMounted && (
				<BusinessProfile
					onHide={() => setBusinessProfileVisible(false)}
					handleCheckSettingsRefreshStatus={handleCheckSettingsRefreshStatus}
					profilePhoto={profilePhoto}
					showOpenInWhatsApp={showOpenInWhatsApp}
					isExiting={businessProfileTransition.isExiting}
					onAnimationEnd={businessProfileTransition.handleAnimationEnd}
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

			<ChangePasswordDialog
				open={isChangePasswordDialogVisible}
				setOpen={setChangePasswordDialogVisible}
			/>

			<CreateUserDialog
				open={isCreateUserDialogVisible}
				setOpen={setCreateUserDialogVisible}
			/>

			<OpenInWhatsAppDialog
				open={isOpenInWhatsAppDialogVisible}
				setOpen={setOpenInWhatsAppDialogVisible}
				profilePhoto={profilePhoto}
			/>

			{notificationsTransition.isMounted && (
				<Notifications
					onHide={() => setNotificationsVisible(false)}
					isExiting={notificationsTransition.isExiting}
					onAnimationEnd={notificationsTransition.handleAnimationEnd}
				/>
			)}

			{userListTransition.isMounted && (
				<UserListView
					onHide={() => setUserListVisible(false)}
					isExiting={userListTransition.isExiting}
					onAnimationEnd={userListTransition.handleAnimationEnd}
				/>
			)}
		</div>
	);
};

export default Sidebar;
