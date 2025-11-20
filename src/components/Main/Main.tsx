import React, { useContext, useEffect, useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import ChatView from './Chat/ChatView';
import { Button, Fade, Snackbar } from '@mui/material';
import PubSub from 'pubsub-js';
import axios, { AxiosError } from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SearchMessage from '../SearchMessage';
import ContactDetails from './ContactDetails';
import LoadingScreen from './LoadingScreen';
import Alert from '@mui/material/Alert';
import 'url-search-params-polyfill';
import {
	CONTACTS_TEMP_LIMIT,
	EVENT_TOPIC_CHAT_ASSIGNMENT,
	EVENT_TOPIC_CHAT_MESSAGE_STATUS_CHANGE,
	EVENT_TOPIC_CHAT_TAGGING,
	EVENT_TOPIC_DISPLAY_ERROR,
	EVENT_TOPIC_FORCE_REFRESH_CHAT,
	EVENT_TOPIC_FORCE_REFRESH_CHAT_LIST,
	EVENT_TOPIC_MARKED_AS_RECEIVED,
	EVENT_TOPIC_NEW_CHAT_MESSAGES,
	EVENT_TOPIC_UNSUPPORTED_FILE,
} from '@src/Constants';
import PreviewMedia from './PreviewMedia';
import { getToken } from '@src/helpers/StorageHelper';
import ChatAssignment from './ChatAssignment';
import ChatTags from './ChatTags';
import ChatTagsList from './ChatTagsList';
import DownloadUnsupportedFile from '../DownloadUnsupportedFile';
import moment from 'moment';
import { clearUserSession, handleIfUnauthorized } from '@src/helpers/ApiHelper';
import { getWebSocketURL } from '@src/helpers/URLHelper';
import { isIPad13, isMobileOnly } from 'react-device-detect';
import UploadMediaIndicator from './Sidebar/UploadMediaIndicator';
import { useTranslation } from 'react-i18next';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { setTemplates } from '@src/store/reducers/templatesReducer';
import { setCurrentUser } from '@src/store/reducers/currentUserReducer';
import { setTags } from '@src/store/reducers/tagsReducer';
import { prepareContactProvidersData } from '@src/helpers/ContactProvidersHelper';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setUsers } from '@src/store/reducers/usersReducer';
import { setSavedResponses } from '@src/store/reducers/savedResponsesReducer';
import {
	setChatAssignment,
	setChatTagging,
} from '@src/store/reducers/chatsReducer';
import { setGroups } from '@src/store/reducers/groupsReducer';
import useResolveContacts from '@src/hooks/useResolveContacts';
import MessageStatuses from '@src/components/MessageStatuses';
import {
	setSearchMessagesVisible,
	setState,
} from '@src/store/reducers/UIReducer';
import { SnackbarCloseReason } from '@mui/material/Snackbar/Snackbar';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import { setNewMessages } from '@src/store/reducers/newMessagesReducer';
import {
	createSavedResponse,
	fetchSavedResponses,
} from '@src/api/savedResponsesApi';
import { fetchCurrentUser, fetchUsers } from '@src/api/usersApi';
import { User, UserList } from '@src/types/users';
import { fetchTags } from '@src/api/tagsApi';
import { fetchGroups } from '@src/api/groupsApi';
import { GroupList } from '@src/types/groups';
import { fetchTemplates } from '@src/api/templatesApi';
import { TemplateList } from '@src/types/templates';
import {
	Message,
	WebhookMessage,
	WebhookMessageStatus,
} from '@src/types/messages';
import {
	fromAssignmentEvent,
	fromTaggingEvent,
} from '@src/helpers/MessageHelper';
import { fetchContacts } from '@src/api/contactsApi';
import api from '@src/api/axiosInstance';
import { setWaId } from '@src/store/reducers/waIdReducer';
import * as Sentry from '@sentry/browser';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { setIsUserAvailable } from '@src/store/reducers/isUserAvailableReducer';

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

const Main: React.FC = () => {
	const config = useContext(AppConfigContext);

	const {
		loadingProgress,
		hasFailedMessages,
		isBlurred,
		isUploadingMedia,
		isTemplatesFailed,
		// selectedTags,
		// selectedChats,
		isChatAssignmentVisible,
		isMessageStatusesVisible,
		isContactDetailsVisible,
		isSearchMessagesVisible,
	} = useAppSelector((state) => state.UI);
	const previewMediaObject = useAppSelector(
		(state) => state.previewMediaObject.value
	);
	const newMessages = useAppSelector((state) => state.newMessages.value);
	const currentUser = useAppSelector((state) => state.currentUser.value);

	const dispatch = useAppDispatch();

	const { t } = useTranslation();

	const { waId } = useParams();

	const [checked, setChecked] = useState(false);
	const [isTemplatesReady, setTemplatesReady] = useState(false);
	const [isSuccessVisible, setSuccessVisible] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [infoMessage, setInfoMessage] = useState('');
	const [isInfoVisible, setInfoVisible] = useState(false);
	const [isErrorVisible, setErrorVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [isChatTagsVisible, setChatTagsVisible] = useState(false);
	const [isChatTagsListVisible, setChatTagsListVisible] = useState(false);
	const [isDownloadUnsupportedFileVisible, setDownloadUnsupportedFileVisible] =
		useState(false);
	const [infoClickAction, setInfoClickAction] = useState<(() => void) | null>(
		null
	);

	const [searchMessagesInitialKeyword, setSearchMessagesInitialKeyword] =
		useState('');

	const [unsupportedFile, setUnsupportedFile] = useState();

	const [messageWithStatuses, setMessageWithStatuses] = useState<Message>();

	const [, setNotificationHistory] = useState<{
		[key: string]: string[];
	}>({});

	const { resolveContact, contactProvidersData, setContactProvidersData } =
		useResolveContacts();
	const navigate = useNavigate();
	const location = useLocation();
	const query = useQuery();

	const confirmationMessage = t(
		'There are unsent messages in the chat. If you continue, they will be deleted. Are you sure you want to continue?'
	);

	const checkIsChatOnly = () => {
		return (query.get('chatonly') || query.get('chat_only')) === '1';
	};

	const [isChatOnly] = useState(checkIsChatOnly());
	const [isHideLogo] = useState(query.get('hide_logo') === '1');
	const [isMaximize] = useState(query.get('maximize') === '1');

	const setProgress = (value: number) => {
		if (value > loadingProgress) {
			dispatch(setState({ loadingProgress: value }));
		}
	};

	const setLoadingComponent = (value: string) => {
		dispatch(setState({ loadingComponent: value }));
	};

	const displaySuccess = (message: string) => {
		setSuccessMessage(message);
		setSuccessVisible(true);
	};

	const displayInfo = (
		message: string,
		onClickInfo: (() => void) | null = null
	) => {
		setInfoMessage(message);
		setInfoVisible(true);
		setInfoClickAction(() => onClickInfo);
	};

	const displayError = (error: AxiosError | any) => {
		if (!axios.isCancel(error)) {
			setErrorMessage(
				error.response?.data?.reason ??
					error.response?.data?.detail ??
					'An error has occurred.'
			);
			setErrorVisible(true);
		}
	};

	const displayCustomError = (error: string) => {
		setErrorMessage(error);
		setErrorVisible(true);
	};

	const handleSuccessClose = (
		event: React.SyntheticEvent<any> | Event,
		reason?: string
	) => {
		if (reason === 'clickaway') {
			return;
		}

		setSuccessVisible(false);
	};

	const handleInfoClose = (
		event: React.SyntheticEvent<any> | Event,
		reason?: string
	) => {
		if (reason === 'clickaway') {
			return;
		}

		setInfoVisible(false);
	};

	const handleErrorClose = (
		event: any,
		reason?: string | SnackbarCloseReason
	) => {
		if (reason === 'clickaway') {
			return;
		}

		setErrorVisible(false);
	};

	const goToChatByWaId = (_waId: string) => {
		navigate(`/main/chat/${_waId}${location.search}`);
	};

	const displayNotification = (
		title: string,
		body: string,
		chatWaId: string
	) => {
		if (isChatOnly) return;

		// Android web app interface
		if (window.AndroidWebInterface) {
			window.AndroidWebInterface.displayNotification(title, body, chatWaId);
		}

		function displayNtf() {
			const timeString = moment().seconds(0).milliseconds(0).toISOString();

			setNotificationHistory((prevState) => {
				// Notification limit per minute
				if (
					(prevState[timeString]?.length ?? 0) >=
					(config?.APP_NOTIFICATIONS_LIMIT_PER_MINUTE
						? parseInt(config.APP_NOTIFICATIONS_LIMIT_PER_MINUTE)
						: null ?? 8)
				) {
					console.info('Cancelled a notification.');
					return prevState;
				}

				// TODO: Use ServiceWorkerRegistration instead to fix notifications on Android
				try {
					// eslint-disable-next-line no-unused-vars
					const notification = new Notification(title, {
						body: body,
						icon: process.env.REACT_APP_LOGO_URL ?? '/logo.png',
						tag: chatWaId + timeString,
					});

					notification.onclick = function () {
						window.focus();

						if (waId) {
							goToChatByWaId(chatWaId);
						}
					};
				} catch (e) {
					console.log(e);
				}

				if (!prevState.hasOwnProperty(timeString)) {
					prevState[timeString] = [];
				}

				prevState[timeString].push(chatWaId);

				// Clear older elements to prevent growing
				const nextState: { [key: string]: string[] } = {};
				nextState[timeString] = prevState[timeString];

				return { ...nextState };
			});
		}

		if (!window.Notification) {
			console.log('Browser does not support notifications.');
		} else {
			// Check if permission is already granted
			if (Notification.permission === 'granted') {
				displayNtf();
			} else {
				// Request permission from user, handling both Promise and non-Promise versions
				try {
					const permissionResult = Notification.requestPermission();

					if (permissionResult instanceof Promise) {
						permissionResult
							.then(function (p) {
								if (p === 'granted') {
									displayNtf();
								} else {
									console.log('User blocked notifications.');
								}
							})
							.catch(function (err) {
								console.error('Notification permission error:', err);
							});
					} else {
						// Some browsers return a string directly
						if (permissionResult === 'granted') {
							displayNtf();
						} else {
							console.log('User blocked notifications.');
						}
					}
				} catch (err) {
					console.error('Notification permission exception:', err);
				}
			}
		}
	};

	const onDisplayError = function (msg: string, data: any) {
		displayCustomError(data);
	};

	useEffect(() => {
		// Display custom errors in any component
		window.displayCustomError = displayCustomError;

		// Display success in any component
		window.displaySuccess = displaySuccess;

		// Display Axios errors in any component
		window.displayError = displayError;

		// We assign this method to window, to be able to call it from outside (eg: mobile app)
		window.goToChatByWaId = goToChatByWaId;

		if (!getToken()) {
			clearUserSession('notLoggedIn', location, navigate);
		} else {
			// Retrieve current user, this will trigger other requests
			retrieveCurrentUser();
		}

		const handleBrowserOffline = () => {
			dispatch(setState({ isBrowserOffline: true }));
		};

		const handleBrowserOnline = () => {
			dispatch(setState({ isBrowserOffline: false }));

			// Force refresh chat list
			PubSub.publish(EVENT_TOPIC_FORCE_REFRESH_CHAT_LIST, true);
			// Force refresh chat
			PubSub.publish(EVENT_TOPIC_FORCE_REFRESH_CHAT, true);
		};

		window.addEventListener('offline', handleBrowserOffline);
		window.addEventListener('online', handleBrowserOnline);

		const onUnsupportedFileEvent = function (msg: string, data: any) {
			setUnsupportedFile(data);
			setDownloadUnsupportedFileVisible(true);
		};

		// EventBus
		const displayErrorEventToken = PubSub.subscribe(
			EVENT_TOPIC_DISPLAY_ERROR,
			onDisplayError
		);
		const unsupportedFileEventToken = PubSub.subscribe(
			EVENT_TOPIC_UNSUPPORTED_FILE,
			onUnsupportedFileEvent
		);

		return () => {
			window.removeEventListener('offline', handleBrowserOffline);
			window.removeEventListener('online', handleBrowserOnline);
			PubSub.unsubscribe(displayErrorEventToken);
			PubSub.unsubscribe(unsupportedFileEventToken);
		};
	}, []);

	useEffect(() => {
		const CODE_NORMAL = 1000;
		const CODE_GOING_AWAY = 1001;
		let ws: ReconnectingWebSocket | null = null;

		let socketClosedAt: Date | undefined;
		let hasConnectedOnce = false;
		let isHandledConnectionError = false;

		// Create spans
		let wsSpan: any = undefined;
		let disconnectSpan: any = undefined;

		const connect = () => {
			if (loadingProgress < 100) {
				return;
			}

			console.log('Connecting to websocket server...');

			// Start a Sentry span for the WS connection lifecycle
			Sentry.startSpan(
				{
					name: 'websocket.connect',
					op: 'websocket.connect',
				},
				(span) => {
					wsSpan = span;
					return wsSpan;
				}
			);

			// WebSocket, consider a separate env variable for ws address
			ws = new ReconnectingWebSocket(
				getWebSocketURL(api.defaults.baseURL ?? ''),
				undefined,
				{
					debug: false,
				}
			);

			ws.addEventListener('open', () => {
				console.log('Connected to websocket server.');

				// Breadcrumb for visibility in Sentry issues
				Sentry.addBreadcrumb({
					category: 'websocket',
					message: 'Connected to websocket server.',
					level: 'info',
				});

				// Mark connection attribute
				wsSpan?.setAttribute('connection_status', 'opened');
				wsSpan?.setAttribute('connected_at', new Date().toISOString());

				hasConnectedOnce = true;

				// Update state
				dispatch(setState({ isWebSocketDisconnected: false }));

				ws?.send(JSON.stringify({ token: getToken() }));

				if (socketClosedAt) {
					const now = new Date();
					const differenceInMinutes =
						Math.abs(now.getTime() - socketClosedAt.getTime()) / 1000 / 60;

					// If window was blurred for more than 5 minutes
					if (differenceInMinutes >= 5) {
						window.location.reload();
					} else {
						socketClosedAt = undefined;
					}
				}
			});

			ws.addEventListener('close', (event) => {
				// Start a short-lived span for the disconnect event
				Sentry.startSpan(
					{
						name: 'websocket.disconnect',
						op: 'websocket.disconnect',
					},
					(span) => {
						disconnectSpan = span;
						return disconnectSpan;
					}
				);

				// Add breadcrumb with close details
				Sentry.addBreadcrumb({
					category: 'websocket',
					message: `WebSocket connection closed`,
					data: {
						code: event.code,
						reason: event.reason,
						wasClean: event.wasClean,
					},
					level: event.wasClean ? 'info' : 'warning',
				});

				// Attach attributes to both spans for better searchable context
				disconnectSpan?.setAttributes({
					close_code: event.code,
					reason: event.reason,
					was_clean: event.wasClean,
				});
				wsSpan?.setAttribute('close_code', event.code);
				wsSpan?.setAttribute('close_reason', event.reason);
				wsSpan?.setAttribute('was_clean', event.wasClean);

				if (event.code !== CODE_GOING_AWAY) {
					// Update state if not caused by page unload or URL change (Firefox)
					dispatch(
						setState({
							isWebSocketDisconnected: true,
							webSocketDisconnectionCode: event.code,
						})
					);
				}

				switch (event.code) {
					case CODE_NORMAL:
						console.log('WebSocket closed normally.');
						break;
					case CODE_GOING_AWAY:
						console.log(
							'WebSocket closed: going away (tab navigated or closed).'
						);
						break;
					default:
						console.warn(
							`WebSocket closed unexpectedly with code: ${event.code}`
						);
				}

				if (event.code !== CODE_NORMAL) {
					// Report the error to Sentry if caused by server
					if (
						[1002, 1003, 1006, 1009, 1011, 1012, 1013, 1015].includes(
							event.code
						)
					) {
						Sentry.captureException(
							new Error(
								`WebSocket closed unexpectedly with code: ${event.code}`
							),
							{
								fingerprint: ['websocket-error', ws?.url ?? ''],
								extra: {
									event,
								},
							}
						);
					}

					socketClosedAt = new Date();
				} else {
					console.log('WebSocket closed and it will re-connect automatically.');
				}

				// Set span statuses and finish spans
				if (event.wasClean) {
					disconnectSpan?.setStatus?.('ok');
				} else {
					disconnectSpan?.setStatus?.('internal_error');
				}
				disconnectSpan?.end();

				// End the lifecycle span if still open
				wsSpan?.end();
			});

			ws.addEventListener('error', (event) => {
				// Check if connection error is already reported
				if (!hasConnectedOnce && isHandledConnectionError) {
					return;
				}

				// Mark as connection error is reported
				if (!hasConnectedOnce && !isHandledConnectionError) {
					isHandledConnectionError = true;
				}

				// Breadcrumb + capture
				Sentry.addBreadcrumb({
					category: 'websocket',
					message: 'WebSocket error occurred',
					data: { event },
					level: 'error',
				});

				// Report error to Sentry
				Sentry.captureException(new Error('WebSocket error occurred.'), {
					extra: {
						event,
					},
				});

				// Annotate the lifecycle span
				wsSpan?.setAttribute('error', JSON.stringify(event));
				wsSpan?.setStatus?.('internal_error');
			});

			ws.addEventListener('message', (event) => {
				handleWSIncomingMessage(event);
			});
		};

		connect();

		return () => {
			ws?.close(CODE_NORMAL);
			// Ensure any lifecycle span is ended on unmount
			wsSpan?.end?.();
			ws = null;
		};
	}, [loadingProgress]);

	const handleWSIncomingMessage = (event: MessageEvent<any>) => {
		try {
			const data = JSON.parse(event.data) as WebhookMessage;
			console.log(data);

			// Breadcrumb for each message
			Sentry.addBreadcrumb({
				category: 'websocket',
				message: 'WebSocket message received',
				level: 'info',
			});

			if (data.type === 'waba_webhook') {
				const wabaPayload = data.waba_payload;

				// Incoming messages
				const incomingMessages = wabaPayload?.incoming_messages;

				if (incomingMessages) {
					const preparedMessages: ChatMessageList = {};

					incomingMessages.forEach((message: Message) => {
						preparedMessages[message.waba_payload?.id ?? message.id] = message;
					});

					PubSub.publish(EVENT_TOPIC_NEW_CHAT_MESSAGES, preparedMessages);
				}

				// Outgoing messages
				const outgoingMessages = wabaPayload?.outgoing_messages;

				if (outgoingMessages) {
					const preparedMessages: ChatMessageList = {};

					outgoingMessages.forEach((message: Message) => {
						preparedMessages[message.waba_payload?.id ?? message.id] = message;
					});

					PubSub.publish(EVENT_TOPIC_NEW_CHAT_MESSAGES, preparedMessages);
				}

				// Statuses
				const statuses = wabaPayload?.statuses;

				if (statuses) {
					const preparedStatuses: { [key: string]: WebhookMessageStatus } = {};
					statuses.forEach(
						(statusObj) => (preparedStatuses[statusObj.id] = statusObj)
					);

					PubSub.publish(
						EVENT_TOPIC_CHAT_MESSAGE_STATUS_CHANGE,
						preparedStatuses
					);
				}

				// Chat assignment
				const chatAssignment = wabaPayload?.chat_assignment;

				if (chatAssignment) {
					const preparedMessages: ChatMessageList = {};
					const prepared = fromAssignmentEvent(chatAssignment);
					preparedMessages[prepared.id] = prepared;

					// Display a notification when a chat is assigned to current user by another user
					if (
						prepared.assignment_event?.assigned_to_user_set?.id ==
							currentUser?.id &&
						prepared.assignment_event?.done_by?.id !== currentUser?.id
					) {
						displayNotification(
							t('New assignment'),
							t('A new chat has been assigned to you!'),
							prepared.customer_wa_id
						);
						displayInfo(t('A new chat has been assigned to you!'), () => {
							navigate(`/main/chat/${prepared.customer_wa_id}`);
						});
					}

					PubSub.publish(EVENT_TOPIC_CHAT_ASSIGNMENT, preparedMessages);

					// Update chats with delay not to break EventBus
					setTimeout(function () {
						dispatch(
							setChatAssignment({
								waId: prepared.customer_wa_id,
								assignmentEvent: prepared.assignment_event,
							})
						);
					}, 100);
				}

				// Chat tagging
				const chatTagging = wabaPayload?.chat_tagging;

				if (chatTagging) {
					const preparedMessages: ChatMessageList = {};
					const prepared = fromTaggingEvent(chatTagging);
					preparedMessages[prepared.id] = prepared;

					PubSub.publish(EVENT_TOPIC_CHAT_TAGGING, preparedMessages);

					// Update chats with delay not to break EventBus
					setTimeout(function () {
						// Update chats
						dispatch(
							setChatTagging({
								waId: prepared.customer_wa_id,
								taggingEvent: prepared.tagging_event,
							})
						);
					}, 100);
				}
			}
		} catch (error) {
			console.error(error);
			console.log(event.data);
		}
	};

	useEffect(() => {
		// Window close event
		window.addEventListener('beforeunload', alertUser);
		return () => {
			window.removeEventListener('beforeunload', alertUser);
		};
	}, [hasFailedMessages]);

	const alertUser = (e: BeforeUnloadEvent) => {
		if (hasFailedMessages) {
			if (!window.confirm(confirmationMessage)) {
				e.preventDefault();
				e.returnValue = '';
			}
		}
	};

	useEffect(() => {
		let tryLoadingTemplatesTimeoutId:
			| string
			| number
			| NodeJS.Timeout
			| undefined;
		if (isTemplatesFailed) {
			let timeout = 10000;
			const delay = () => {
				timeout += 1000;
				return timeout;
			};

			let retryTask = () => {
				tryLoadingTemplatesTimeoutId = setTimeout(() => {
					listTemplates(true);
					retryTask();
				}, delay());
			};

			retryTask();
		}

		return () => {
			clearTimeout(tryLoadingTemplatesTimeoutId);
		};
	}, [isTemplatesFailed]);

	useEffect(() => {
		function onBlur() {
			dispatch(setState({ isBlurred: true }));
		}

		function onFocus() {
			dispatch(setState({ isBlurred: false }));
		}

		window.addEventListener('blur', onBlur);
		window.addEventListener('focus', onFocus);

		return () => {
			window.removeEventListener('blur', onBlur);
			window.removeEventListener('focus', onFocus);
		};
	}, [isBlurred]);

	useEffect(() => {
		setChecked(true);
		dispatch(setWaId(waId));

		return () => {
			// Hide search messages, contact details, message statuses and chat assignment
			dispatch(
				setState({
					isSearchMessagesVisible: false,
					isContactDetailsVisible: false,
					isMessageStatusesVisible: false,
					isChatAssignmentVisible: false,
				})
			);
		};
	}, [waId]);

	useEffect(() => {
		const onMarkedAsReceived = function (msg: string, data: any) {
			const relatedWaId = data;

			const newMessagesNextState = { ...newMessages };
			delete newMessagesNextState[relatedWaId];

			dispatch(setNewMessages(newMessagesNextState));
		};

		const markedAsReceivedEventToken = PubSub.subscribe(
			EVENT_TOPIC_MARKED_AS_RECEIVED,
			onMarkedAsReceived
		);

		return () => {
			PubSub.unsubscribe(markedAsReceivedEventToken);
		};
	}, [newMessages]);

	// ** 2 **
	const listUsers = async () => {
		setLoadingComponent('Users');

		try {
			const data = await fetchUsers(5000);
			const userList: UserList = {};
			data.results.forEach((user: User) => {
				userList[user.id] = user;
			});
			dispatch(setUsers(userList));
		} catch (error) {
			console.error('Error in listUsers', error);
			dispatch(setState({ isInitialResourceFailed: true }));
		} finally {
			setProgress(15);
			await listGroups();
		}
	};

	// ** 3 **
	const listGroups = async () => {
		setLoadingComponent('Groups');

		try {
			const data = await fetchGroups();
			const preparedGroups: GroupList = {};
			data.results.forEach((item) => (preparedGroups[item.id] = item));
			dispatch(setGroups(preparedGroups));
		} catch (error) {
			console.error('Error in listGroups', error);
			dispatch(setState({ isInitialResourceFailed: true }));
		} finally {
			setProgress(25);

			// Trigger next request
			listContacts();
		}
	};

	// ** 1 **
	const retrieveCurrentUser = async () => {
		setLoadingComponent('Current User');

		try {
			const data = await fetchCurrentUser();
			dispatch(setCurrentUser(data));
			dispatch(setIsUserAvailable(data.profile?.is_available ?? false));

			const role = data.profile?.role;

			// Only admins and users can access
			if (role !== 'admin' && role !== 'user') {
				clearUserSession('incorrectRole', location, navigate);
			}
		} catch (error: any | AxiosError) {
			console.error('Error retrieving current user', error);

			// If not 404 (prevents false alarm when logged in as superadmin)
			if (error?.response?.status !== 404) {
				dispatch(setState({ isInitialResourceFailed: true }));
			}

			// Exceptional handling for invalid token
			if (error?.response?.status === 403) {
				clearUserSession('invalidToken', undefined, navigate);
			} else {
				handleIfUnauthorized(error, navigate);
			}
		} finally {
			setProgress(10);

			// Trigger next request
			await listUsers();
		}
	};

	// ** 6 **
	const listTemplates = async (isRetry: boolean) => {
		setLoadingComponent('Templates');

		const completeCallback = () => {
			dispatch(setState({ isLoadingTemplates: false }));
			setTemplatesReady(true);

			setProgress(70);

			// Trigger next request
			listTags();
		};

		try {
			const data = await fetchTemplates();
			const templateList: TemplateList = {};
			data.results
				.filter((item) => item.status === 'approved')
				.forEach((item) => (templateList[item.name] = item));
			dispatch(setTemplates(templateList));

			if (!isRetry) {
				completeCallback();
			}

			dispatch(setState({ isTemplatesFailed: false }));
		} catch (error: any | AxiosError) {
			if (!isRetry) {
				if (error.response) {
					const status = error.response.status;
					// Status code >= 500 means template management is not available
					if (status >= 500) {
						const reason = error.response.data?.reason;
						displayCustomError(reason);
						completeCallback();

						// To trigger retrying periodically
						dispatch(setState({ isTemplatesFailed: true }));
					} else {
						window.displayError(error);
					}
				} else {
					// auto skip if no response
					completeCallback();
					window.displayError(error);
				}

				dispatch(setState({ isInitialResourceFailed: true }));
			} else {
				console.error(error);
			}
		}
	};

	// ** 5 **
	const handleFetchSavedResponses = async () => {
		try {
			const data = await fetchSavedResponses();
			dispatch(setSavedResponses(data.results));
		} catch (error) {
			console.error('Failed to fetch responses:', error);
			dispatch(setState({ isInitialResourceFailed: true }));
		} finally {
			setProgress(50);
			await listTemplates(false);
		}
	};

	const handleCreateSavedResponse = async (text: string) => {
		try {
			await createSavedResponse({ text });

			// Display a success message
			displaySuccess('Saved as response successfully!');

			// Reload saved responses
			await handleFetchSavedResponses();
		} catch (error) {
			console.error(error);
		}
	};

	// ** 4 **
	const listContacts = async () => {
		setLoadingComponent('Contacts');

		// Check if it needs to be loaded
		if (Object.keys(contactProvidersData).length !== 0) {
			setProgress(35);
			setLoadingComponent('Saved Responses');
			await handleFetchSavedResponses();
			return;
		}

		let mergedResults: any[] = [];
		const completeCallback = () => {
			const preparedData = prepareContactProvidersData(mergedResults);
			setContactProvidersData(preparedData);

			setProgress(35);
			setLoadingComponent('Saved Responses');

			// Trigger next request
			handleFetchSavedResponses();
		};

		const makeRequest = async (pages?: string | undefined | null) => {
			try {
				const data = await fetchContacts({
					limit: CONTACTS_TEMP_LIMIT,
					pages: pages,
				});

				mergedResults = mergedResults.concat(data.results);
				if (data.next && mergedResults.length < data.count) {
					const nextURL = new URL(data.next);
					const pages = nextURL.searchParams.get('pages');
					await makeRequest(pages);
				} else {
					completeCallback();
				}
			} catch (error: any | AxiosError) {
				console.error(error);
				dispatch(setState({ isInitialResourceFailed: true }));
			}
		};

		await makeRequest();
	};

	// ** 7 **
	const listTags = async () => {
		try {
			const data = await fetchTags();
			dispatch(setTags(data.results));
		} catch (error) {
			console.error('Error in listTags', error);
		}
	};

	const searchMessagesByKeyword = (_keyword: string) => {
		setSearchMessagesInitialKeyword(_keyword);
		dispatch(setSearchMessagesVisible(true));
	};

	return (
		<Fade in={checked}>
			<div
				className={
					'app__body' +
					(isIPad13 ? ' absoluteFullscreen' : '') +
					(isMaximize ? ' maximized' : '')
				}
			>
				{isTemplatesReady && (
					<Sidebar
						isLoaded={loadingProgress >= 100}
						displayNotification={displayNotification}
						contactProvidersData={contactProvidersData}
						isChatOnly={isChatOnly}
						setChatTagsListVisible={setChatTagsListVisible}
					/>
				)}

				{isTemplatesReady && (
					<ChatView
						createSavedResponse={handleCreateSavedResponse}
						contactProvidersData={contactProvidersData}
						retrieveContactData={resolveContact}
						displayNotification={displayNotification}
						isChatOnly={isChatOnly}
						setChatTagsVisible={setChatTagsVisible}
						searchMessagesByKeyword={searchMessagesByKeyword}
						setMessageWithStatuses={setMessageWithStatuses}
					/>
				)}

				{isSearchMessagesVisible && (
					<SearchMessage
						initialKeyword={searchMessagesInitialKeyword}
						setInitialKeyword={setSearchMessagesInitialKeyword}
					/>
				)}

				{isContactDetailsVisible && (
					<ContactDetails
						contactProvidersData={contactProvidersData}
						retrieveContactData={resolveContact}
					/>
				)}

				{isMessageStatusesVisible && (
					<MessageStatuses message={messageWithStatuses} />
				)}

				{isChatAssignmentVisible && (
					<ChatAssignment
						waId={waId ?? ''}
						open={isChatAssignmentVisible}
						setOpen={(value: boolean) =>
							dispatch(setState({ isChatAssignmentVisible: value }))
						}
					/>
				)}

				{isChatTagsVisible && (
					<ChatTags
						waId={waId}
						open={isChatTagsVisible}
						setOpen={setChatTagsVisible}
					/>
				)}

				{isChatTagsListVisible && (
					<ChatTagsList
						open={isChatTagsListVisible}
						setOpen={setChatTagsListVisible}
					/>
				)}

				{previewMediaObject && <PreviewMedia data={previewMediaObject} />}

				{isDownloadUnsupportedFileVisible && (
					<DownloadUnsupportedFile
						open={isDownloadUnsupportedFileVisible}
						setOpen={setDownloadUnsupportedFileVisible}
						data={unsupportedFile}
					/>
				)}

				<Fade in={loadingProgress < 100} timeout={{ exit: 1000 }} unmountOnExit>
					<div className="loadingScreenOuter">
						<LoadingScreen isHideLogo={isHideLogo} />
					</div>
				</Fade>

				<Snackbar
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					open={isSuccessVisible}
					autoHideDuration={6000}
					onClose={handleSuccessClose}
				>
					<Alert
						onClose={(event) => handleSuccessClose(event)}
						severity="success"
						elevation={4}
					>
						{t(successMessage)}
					</Alert>
				</Snackbar>

				<Snackbar
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					open={isInfoVisible}
					action={
						<Button
							color="secondary"
							size="small"
							onClick={() => infoClickAction?.()}
						>
							{t('Display')}
						</Button>
					}
					autoHideDuration={6000}
					onClose={handleInfoClose}
				>
					<Alert
						onClose={(event) => handleInfoClose(event)}
						severity="info"
						elevation={4}
					>
						{t(infoMessage)}
					</Alert>
				</Snackbar>

				<Snackbar
					anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
					open={isErrorVisible}
					autoHideDuration={6000}
					onClose={handleErrorClose}
				>
					<Alert onClose={handleErrorClose} severity="error" elevation={4}>
						{t(errorMessage)}
					</Alert>
				</Snackbar>

				{isUploadingMedia && isMobileOnly && (
					<UploadMediaIndicator isMobile={true} />
				)}
			</div>
		</Fade>
	);
};

export default Main;
