import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import Chat from './Chat/Chat';
import { Fade, Snackbar } from '@mui/material';
import PubSub from 'pubsub-js';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SearchMessage from '../SearchMessage';
import ContactDetails from './ContactDetails';
import LoadingScreen from './LoadingScreen';
import Alert from '@mui/material/Alert';
import 'url-search-params-polyfill';
import {
	CONTACTS_TEMP_LIMIT,
	EVENT_TOPIC_BULK_MESSAGE_TASK,
	EVENT_TOPIC_BULK_MESSAGE_TASK_ELEMENT,
	EVENT_TOPIC_BULK_MESSAGE_TASK_STARTED,
	EVENT_TOPIC_CHAT_ASSIGNMENT,
	EVENT_TOPIC_CHAT_MESSAGE_STATUS_CHANGE,
	EVENT_TOPIC_CHAT_TAGGING,
	EVENT_TOPIC_CLEAR_TEXT_MESSAGE_INPUT,
	EVENT_TOPIC_DISPLAY_ERROR,
	EVENT_TOPIC_MARKED_AS_RECEIVED,
	EVENT_TOPIC_NEW_CHAT_MESSAGES,
	EVENT_TOPIC_UNSUPPORTED_FILE,
} from '@src/Constants';
import ChatMessageModel from '../../api/models/ChatMessageModel';
import PreviewMedia from './PreviewMedia';
import { getToken } from '@src/helpers/StorageHelper';
import ChatAssignment from './ChatAssignment';
import ChatTags from './ChatTags';
import ChatTagsList from './ChatTagsList';
import DownloadUnsupportedFile from '../DownloadUnsupportedFile';
import moment from 'moment';
import { clearUserSession } from '@src/helpers/ApiHelper';
import BulkMessageTaskElementModel from '../../api/models/BulkMessageTaskElementModel';
import BulkMessageTaskModel from '../../api/models/BulkMessageTaskModel';
import { getWebSocketURL } from '@src/helpers/URLHelper';
import { isIPad13, isMobileOnly } from 'react-device-detect';
import UploadMediaIndicator from './Sidebar/UploadMediaIndicator';
import { useTranslation } from 'react-i18next';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import SendBulkVoiceMessageDialog from '../SendBulkVoiceMessageDialog';
import BulkSendTemplateViaCSV from '../BulkSendTemplateViaCSV/BulkSendTemplateViaCSV';
import { setTemplates } from '@src/store/reducers/templatesReducer';
import BulkSendTemplateDialog from '../BulkSendTemplateDialog';
import { setCurrentUser } from '@src/store/reducers/currentUserReducer';
import CurrentUserResponse from '../../api/responses/CurrentUserResponse';
import TemplatesResponse from '../../api/responses/TemplatesResponse';
import UploadRecipientsCSV from '../UploadRecipientsCSV';
import { findTagByName } from '@src/helpers/TagHelper';
import { setTags } from '@src/store/reducers/tagsReducer';
import ContactsResponse from '@src/api/responses/ContactsResponse';
import { prepareContactProvidersData } from '@src/helpers/ContactProvidersHelper';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import UsersResponse from '@src/api/responses/UsersResponse';
import { setUsers } from '@src/store/reducers/usersReducer';
import { setSavedResponses } from '@src/store/reducers/savedResponsesReducer';
import SavedResponsesResponse from '@src/api/responses/SavedResponsesResponse';
import {
	setChatAssignment,
	setChatTagging,
} from '@src/store/reducers/chatsReducer';
import BulkSendPayload from '@src/interfaces/BulkSendPayload';
import GroupsResponse from '@src/api/responses/GroupsResponse';
import { setGroups } from '@src/store/reducers/groupsReducer';
import TagsResponse from '@src/api/responses/TagsResponse';
import useResolveContacts from '@src/hooks/useResolveContacts';
import MessageStatuses from '@src/components/MessageStatuses';
import {
	setSearchMessagesVisible,
	setSelectionModeEnabled,
	setState,
} from '@src/store/reducers/UIReducer';
import { SnackbarCloseReason } from '@mui/material/Snackbar/Snackbar';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import NewMessageModel from '@src/api/models/NewMessageModel';
import PersonModel from '@src/api/models/PersonModel';
import PendingMessage from '@src/interfaces/PendingMessage';

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

function Main() {
	const { apiService } = React.useContext(ApplicationContext);
	const config = React.useContext(AppConfigContext);

	const {
		loadingProgress,
		hasFailedMessages,
		isBlurred,
		isUploadingMedia,
		isTemplatesFailed,
		selectedTags,
		selectedChats,
		isMessageStatusesVisible,
		isContactDetailsVisible,
		isSearchMessagesVisible,
	} = useAppSelector((state) => state.UI);
	const tags = useAppSelector((state) => state.tags.value);
	const previewMediaObject = useAppSelector(
		(state) => state.previewMediaObject.value
	);

	const dispatch = useAppDispatch();

	const { t } = useTranslation();

	const { waId } = useParams();

	const [isInitialResourceFailed, setInitialResourceFailed] = useState(false);

	const [checked, setChecked] = useState(false);

	const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);

	const [newMessages, setNewMessages] = useState<{
		[key: string]: NewMessageModel;
	}>({});

	const [templatesReady, setTemplatesReady] = useState(false);

	const [isSuccessVisible, setSuccessVisible] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [isErrorVisible, setErrorVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const [isChatAssignmentVisible, setChatAssignmentVisible] = useState(false);
	const [isChatTagsVisible, setChatTagsVisible] = useState(false);
	const [isChatTagsListVisible, setChatTagsListVisible] = useState(false);
	const [isDownloadUnsupportedFileVisible, setDownloadUnsupportedFileVisible] =
		useState(false);

	const [searchMessagesInitialKeyword, setSearchMessagesInitialKeyword] =
		useState('');

	const [unsupportedFile, setUnsupportedFile] = useState();

	const [chosenContact, setChosenContact] = useState<PersonModel>();

	const [messageWithStatuses, setMessageWithStatuses] =
		useState<ChatMessageModel>();

	const [bulkSendPayload, setBulkSendPayload] = useState<BulkSendPayload>();

	const [isBulkSendTemplateDialogVisible, setBulkSendTemplateDialogVisible] =
		useState(false);

	const [
		isBulkSendTemplateWithCallbackDialogVisible,
		setBulkSendTemplateWithCallbackDialogVisible,
	] = useState(false);

	const [isUploadRecipientsCSVVisible, setUploadRecipientsCSVVisible] =
		useState(false);

	const [isBulkSendTemplateViaCSVVisible, setBulkSendTemplateViaCSVVisible] =
		useState(false);

	const [
		isSendBulkVoiceMessageDialogVisible,
		setSendBulkVoiceMessageDialogVisible,
	] = useState(false);

	const [notificationHistory, setNotificationHistory] = useState<{
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

	const displayError = (error: AxiosError) => {
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

	const handleErrorClose = (
		event: any,
		reason?: string | SnackbarCloseReason
	) => {
		if (reason === 'clickaway') {
			return;
		}

		setErrorVisible(false);
	};

	const finishBulkSendMessage = (payload: BulkMessageTaskModel) => {
		const requestPayload: any = {};
		const messagePayload = { ...bulkSendPayload };
		const recipients = selectedChats;
		const tags = selectedTags;

		const preparedRecipients: { recipient: string }[] = [];
		recipients.forEach((recipient) => {
			preparedRecipients.push({ recipient: recipient });
		});

		const preparedTags: { tag_id: number }[] = [];
		tags.forEach((tag) => {
			preparedTags.push({ tag_id: tag });
		});

		requestPayload.recipients = payload
			? payload.recipients
			: preparedRecipients;
		requestPayload.tags = preparedTags;
		requestPayload.payload = payload
			? { template: payload.template, type: payload.type }
			: messagePayload;

		apiService.bulkSendCall(requestPayload, (response: AxiosResponse) => {
			// Disable selection mode
			dispatch(setSelectionModeEnabled(false));

			// Clear selections
			dispatch(setState({ selectedTags: [], selectedChats: [] }));

			// Clear input if text message
			if (messagePayload.type === 'text') {
				PubSub.publish(EVENT_TOPIC_CLEAR_TEXT_MESSAGE_INPUT);
			}

			const preparedBulkMessageTask = new BulkMessageTaskModel(response.data);
			PubSub.publish(
				EVENT_TOPIC_BULK_MESSAGE_TASK_STARTED,
				preparedBulkMessageTask
			);
		});
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
				// Request permission from user
				// TODO: Safari doesn't return a promise, fix it
				Notification.requestPermission()
					?.then(function (p) {
						if (p === 'granted') {
							displayNtf();
						} else {
							console.log('User blocked notifications.');
						}
					})
					.catch(function (err) {
						console.error(err);
					});
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
			PubSub.unsubscribe(displayErrorEventToken);
			PubSub.unsubscribe(unsupportedFileEventToken);
		};
	}, []);

	useEffect(() => {
		const CODE_NORMAL = 1000;
		let ws: WebSocket;

		let socketClosedAt: Date | undefined;

		const connect = () => {
			if (loadingProgress < 100) {
				return;
			}

			console.log('Connecting to websocket server');

			// WebSocket, consider a separate env variable for ws address
			ws = new WebSocket(getWebSocketURL(apiService.apiBaseURL));

			ws.onopen = function () {
				console.log('Connected to websocket server.');

				ws.send(JSON.stringify({ token: getToken() }));

				if (socketClosedAt) {
					const now = new Date();
					const differenceInMinutes =
						Math.abs(now.getTime() - socketClosedAt.getTime()) / 1000 / 60;

					// If window was blurred for more than 3 hours
					if (differenceInMinutes >= 5) {
						window.location.reload();
					} else {
						socketClosedAt = undefined;
					}
				}
			};

			ws.onclose = function (event) {
				if (event.code !== CODE_NORMAL) {
					console.log('Retrying connection to websocket server in 1 second.');

					socketClosedAt = new Date();

					setTimeout(function () {
						connect();
					}, 1000);
				}
			};

			ws.onerror = function () {
				ws.close();
			};

			ws.onmessage = function (event) {
				try {
					const data = JSON.parse(event.data);
					console.log(data);

					if (data.type === 'waba_webhook') {
						const wabaPayload = data.waba_payload;

						// Incoming messages
						const incomingMessages = wabaPayload?.incoming_messages;

						if (incomingMessages) {
							const preparedMessages: ChatMessageList = {};

							incomingMessages.forEach((message: any) => {
								const messageObj = new ChatMessageModel(message);
								preparedMessages[messageObj.id] = messageObj;
							});

							PubSub.publish(EVENT_TOPIC_NEW_CHAT_MESSAGES, preparedMessages);
						}

						// Outgoing messages
						const outgoingMessages = wabaPayload?.outgoing_messages;

						if (outgoingMessages) {
							const preparedMessages: ChatMessageList = {};

							outgoingMessages.forEach((message: any) => {
								const messageObj = new ChatMessageModel(message);
								preparedMessages[messageObj.id] = messageObj;
							});

							PubSub.publish(EVENT_TOPIC_NEW_CHAT_MESSAGES, preparedMessages);
						}

						// Statuses
						const statuses = wabaPayload?.statuses;

						if (statuses) {
							const preparedStatuses: { [key: string]: any } = {};
							statuses.forEach((statusObj: any) => {
								if (!preparedStatuses.hasOwnProperty(statusObj.id)) {
									preparedStatuses[statusObj.id] = {};
								}

								// Inject getchat id to avoid duplicated messages
								preparedStatuses[statusObj.id].getchatId = statusObj.getchat_id;

								if (statusObj.status === ChatMessageModel.STATUS_SENT) {
									preparedStatuses[statusObj.id].sentTimestamp =
										statusObj.timestamp;
								}

								if (statusObj.status === ChatMessageModel.STATUS_DELIVERED) {
									preparedStatuses[statusObj.id].deliveredTimestamp =
										statusObj.timestamp;
								}

								if (statusObj.status === ChatMessageModel.STATUS_READ) {
									preparedStatuses[statusObj.id].readTimestamp =
										statusObj.timestamp;
								}

								// Handling errors
								if (statusObj.errors) {
									preparedStatuses[statusObj.id].errors = statusObj.errors;
								}
							});

							PubSub.publish(
								EVENT_TOPIC_CHAT_MESSAGE_STATUS_CHANGE,
								preparedStatuses
							);
						}

						// Chat assignment
						const chatAssignment = wabaPayload?.chat_assignment;

						if (chatAssignment) {
							const preparedMessages: ChatMessageList = {};
							const prepared =
								ChatMessageModel.fromAssignmentEvent(chatAssignment);
							preparedMessages[prepared.id] = prepared;

							PubSub.publish(EVENT_TOPIC_CHAT_ASSIGNMENT, preparedMessages);

							// Update chats with delay not to break EventBus
							setTimeout(function () {
								dispatch(
									setChatAssignment({
										waId: prepared.waId,
										assignmentEvent: prepared.assignmentEvent,
									})
								);
							}, 100);
						}

						// Chat tagging
						const chatTagging = wabaPayload?.chat_tagging;

						if (chatTagging) {
							const preparedMessages: ChatMessageList = {};
							const prepared = ChatMessageModel.fromTaggingEvent(chatTagging);
							preparedMessages[prepared.id] = prepared;

							PubSub.publish(EVENT_TOPIC_CHAT_TAGGING, preparedMessages);

							// Update chats with delay not to break EventBus
							setTimeout(function () {
								// Update chats
								dispatch(
									setChatTagging({
										waId: prepared.waId,
										taggingEvent: prepared.taggingEvent,
									})
								);
							}, 100);
						}

						const bulkMessageTasks = wabaPayload?.bulk_message_tasks;

						if (bulkMessageTasks) {
							console.log(bulkMessageTasks);

							const preparedBulkMessageTasks: {
								[key: string]: BulkMessageTaskModel;
							} = {};

							bulkMessageTasks.forEach((task: any) => {
								const prepared = new BulkMessageTaskModel(task);
								preparedBulkMessageTasks[prepared.id] = prepared;
							});

							PubSub.publish(
								EVENT_TOPIC_BULK_MESSAGE_TASK,
								preparedBulkMessageTasks
							);
						}

						const bulkMessageTaskElements =
							wabaPayload?.bulk_message_task_elements;

						if (bulkMessageTaskElements) {
							console.log(bulkMessageTaskElements);

							const preparedBulkMessageTaskElements: {
								[key: string]: BulkMessageTaskElementModel;
							} = {};

							bulkMessageTaskElements.forEach((element: any) => {
								const prepared = new BulkMessageTaskElementModel(element);
								preparedBulkMessageTaskElements[prepared.id] = prepared;
							});

							PubSub.publish(
								EVENT_TOPIC_BULK_MESSAGE_TASK_ELEMENT,
								preparedBulkMessageTaskElements
							);
						}
					}
				} catch (error) {
					console.error(error);
					console.log(event.data);
					// Do not force Sentry if exceptions can't be handled without a user feedback dialog
					//Sentry.captureException(error);
				}
			};
		};

		connect();

		return () => {
			ws?.close(CODE_NORMAL);
		};
	}, [loadingProgress]);

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

		return () => {
			// Hide search messages
			dispatch(setState({ isSearchMessagesVisible: false }));

			// Hide contact details
			dispatch(setState({ isContactDetailsVisible: false }));

			// Hide message statuses
			dispatch(setState({ isMessageStatusesVisible: false }));

			// Hide chat assignment
			setChatAssignmentVisible(false);
		};
	}, [waId]);

	useEffect(() => {
		const onMarkedAsReceived = function (msg: string, data: any) {
			const relatedWaId = data;

			setNewMessages((prevState) => {
				const nextState = prevState;
				delete nextState[relatedWaId];

				return { ...nextState };
			});
		};

		const markedAsReceivedEventToken = PubSub.subscribe(
			EVENT_TOPIC_MARKED_AS_RECEIVED,
			onMarkedAsReceived
		);

		return () => {
			PubSub.unsubscribe(markedAsReceivedEventToken);
		};
	}, [newMessages]);

	// Clear selected chats and tags when bulk send payload changes
	useEffect(() => {
		if (bulkSendPayload) {
			dispatch(setState({ selectedTags: [], selectedChats: [] }));
		}
	}, [bulkSendPayload]);

	// ** 2 **
	const listUsers = async () => {
		setLoadingComponent('Users');

		try {
			apiService.listUsersCall(5000, (response: AxiosResponse) => {
				const usersResponse = new UsersResponse(response.data);

				// Store
				dispatch(setUsers(usersResponse.users));

				setProgress(15);
			});
		} catch (error) {
			console.error('Error in listUsers', error);
			setInitialResourceFailed(true);
		} finally {
			// Trigger next request
			listGroups();
		}
	};

	// ** 3 **
	const listGroups = async () => {
		setLoadingComponent('Groups');

		try {
			apiService.listGroupsCall(undefined, (response: AxiosResponse) => {
				const groupsResponse = new GroupsResponse(response.data);

				// Store
				dispatch(setGroups(groupsResponse.groups));

				setProgress(25);
			});
		} catch (error) {
			console.error('Error in listGroups', error);
			setInitialResourceFailed(true);
		} finally {
			// Trigger next request
			listContacts();
		}
	};

	// ** 1 **
	const retrieveCurrentUser = async () => {
		setLoadingComponent('Current User');

		try {
			apiService.retrieveCurrentUserCall((response: AxiosResponse) => {
				const currentUserResponse = new CurrentUserResponse(response.data);
				dispatch(setCurrentUser(currentUserResponse.currentUser));

				const role = currentUserResponse.currentUser.role;

				// Only admins and users can access
				if (role !== 'admin' && role !== 'user') {
					clearUserSession('incorrectRole', location, navigate);
				}

				setProgress(10);
			}, navigate);
		} catch (error) {
			console.error('Error retrieving current user', error);
			setInitialResourceFailed(true);
		} finally {
			// Trigger next request
			listUsers();
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

		apiService.listTemplatesCall(
			undefined,
			(response: AxiosResponse) => {
				const templatesResponse = new TemplatesResponse(response.data);

				dispatch(setTemplates(templatesResponse.templates));

				if (!isRetry) {
					completeCallback();
				}

				dispatch(setState({ isTemplatesFailed: false }));
			},
			(error: AxiosError) => {
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

					setInitialResourceFailed(true);
				} else {
					console.error(error);
				}
			}
		);
	};

	// ** 5 **
	const listSavedResponses = async () => {
		try {
			apiService.listSavedResponsesCall((response: AxiosResponse) => {
				const savedResponsesResponse = new SavedResponsesResponse(
					response.data
				);

				// Store
				dispatch(setSavedResponses(savedResponsesResponse.savedResponses));

				setProgress(50);
			});
		} catch (error) {
			console.error('Error in listSavedResponses', error);
			setInitialResourceFailed(true);
		} finally {
			// Trigger next request
			listTemplates(false);
		}
	};

	const createSavedResponse = (text: string) => {
		apiService.createSavedResponseCall(text, () => {
			// Display a success message
			displaySuccess('Saved as response successfully!');

			// Reload saved responses
			listSavedResponses();
		});
	};

	// ** 4 **
	const listContacts = async () => {
		setLoadingComponent('Contacts');

		// Check if it needs to be loaded
		if (Object.keys(contactProvidersData).length !== 0) {
			setProgress(35);
			setLoadingComponent('Saved Responses');
			listSavedResponses();
			return;
		}

		let mergedResults: any[] = [];
		const completeCallback = () => {
			const preparedData = prepareContactProvidersData(mergedResults);
			setContactProvidersData(preparedData);

			setProgress(35);
			setLoadingComponent('Saved Responses');

			// Trigger next request
			listSavedResponses();
		};

		const makeRequest = async (pages?: string | undefined | null) => {
			apiService.listContactsCall(
				undefined,
				CONTACTS_TEMP_LIMIT,
				pages,
				undefined,
				(response: AxiosResponse) => {
					const contactsResponse = new ContactsResponse(response.data);
					mergedResults = mergedResults.concat(contactsResponse.results);
					if (
						contactsResponse.next &&
						mergedResults.length < contactsResponse.count
					) {
						const nextURL = new URL(contactsResponse.next);
						const pages = nextURL.searchParams.get('pages');
						makeRequest(pages);
					} else {
						completeCallback();
					}
				},
				(error: AxiosError) => {
					console.error('Error in listContacts', error);
					setInitialResourceFailed(true);
				}
			);
		};

		await makeRequest();
	};

	// ** 7 **
	const listTags = async () => {
		try {
			apiService.listTagsCall((response: AxiosResponse) => {
				const tagsResponse = new TagsResponse(response.data);
				dispatch(setTags(tagsResponse.tags));
			});
		} catch (error) {
			console.error('Error in listTags', error);
		}
	};

	useEffect(() => {
		if (bulkSendPayload) {
			listTags();
		}
	}, [bulkSendPayload]);

	const addBulkSendRecipients = (newWaIds: string[], newTags: string[]) => {
		// Combine with selected chats
		if (newWaIds.length > 0) {
			dispatch(
				setState({
					selectedChats: [...new Set([...newWaIds, ...selectedChats])],
				})
			);
		}

		if (newTags.length > 0) {
			const preparedNewTags: number[] = [];
			newTags.forEach((tagName) => {
				const curTag = findTagByName(tags, tagName);
				if (curTag) {
					preparedNewTags.push(curTag.id);
				}
			});
			dispatch(
				setState({
					selectedTags: [...new Set([...preparedNewTags, ...selectedTags])],
				})
			);
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
				{templatesReady && (
					<Sidebar
						isLoaded={loadingProgress >= 100}
						pendingMessages={pendingMessages}
						setPendingMessages={setPendingMessages}
						newMessages={newMessages}
						setNewMessages={setNewMessages}
						setProgress={setProgress}
						displayNotification={displayNotification}
						contactProvidersData={contactProvidersData}
						isChatOnly={isChatOnly}
						setChatTagsListVisible={setChatTagsListVisible}
						bulkSendPayload={bulkSendPayload}
						finishBulkSendMessage={finishBulkSendMessage}
						setUploadRecipientsCSVVisible={setUploadRecipientsCSVVisible}
						setBulkSendTemplateDialogVisible={setBulkSendTemplateDialogVisible}
						setBulkSendTemplateWithCallbackDialogVisible={
							setBulkSendTemplateWithCallbackDialogVisible
						}
						setBulkSendTemplateViaCSVVisible={setBulkSendTemplateViaCSVVisible}
						setInitialResourceFailed={setInitialResourceFailed}
						setSendBulkVoiceMessageDialogVisible={
							setSendBulkVoiceMessageDialogVisible
						}
					/>
				)}

				{templatesReady && (
					<Chat
						pendingMessages={pendingMessages}
						setPendingMessages={setPendingMessages}
						newMessages={newMessages}
						setChosenContact={setChosenContact}
						createSavedResponse={createSavedResponse}
						contactProvidersData={contactProvidersData}
						retrieveContactData={resolveContact}
						displayNotification={displayNotification}
						isChatOnly={isChatOnly}
						setChatAssignmentVisible={setChatAssignmentVisible}
						setChatTagsVisible={setChatTagsVisible}
						setBulkSendPayload={setBulkSendPayload}
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
						contactData={chosenContact}
						contactProvidersData={contactProvidersData}
						retrieveContactData={resolveContact}
					/>
				)}

				{isMessageStatusesVisible && (
					<MessageStatuses message={messageWithStatuses} />
				)}

				{isChatAssignmentVisible && (
					<ChatAssignment
						waId={waId}
						open={isChatAssignmentVisible}
						setOpen={setChatAssignmentVisible}
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
						<LoadingScreen
							isInitialResourceFailed={isInitialResourceFailed}
							isHideLogo={isHideLogo}
						/>
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
					anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
					open={isErrorVisible}
					autoHideDuration={6000}
					onClose={handleErrorClose}
				>
					<Alert onClose={handleErrorClose} severity="error" elevation={4}>
						{t(errorMessage)}
					</Alert>
				</Snackbar>

				{isUploadingMedia && isMobileOnly && <UploadMediaIndicator />}

				<BulkSendTemplateDialog
					open={isBulkSendTemplateDialogVisible}
					setOpen={setBulkSendTemplateDialogVisible}
					setBulkSendPayload={setBulkSendPayload}
				/>

				<BulkSendTemplateDialog
					open={isBulkSendTemplateWithCallbackDialogVisible}
					setOpen={setBulkSendTemplateWithCallbackDialogVisible}
					setBulkSendPayload={setBulkSendPayload}
					sendCallback={() => {
						setUploadRecipientsCSVVisible(true);
					}}
				/>

				<UploadRecipientsCSV
					open={isUploadRecipientsCSVVisible}
					setOpen={setUploadRecipientsCSVVisible}
					addBulkSendRecipients={addBulkSendRecipients}
					bulkSendPayload={bulkSendPayload}
				/>

				<BulkSendTemplateViaCSV
					open={isBulkSendTemplateViaCSVVisible}
					setOpen={setBulkSendTemplateViaCSVVisible}
					finishBulkSendMessage={finishBulkSendMessage}
				/>

				<SendBulkVoiceMessageDialog
					apiService={apiService}
					open={isSendBulkVoiceMessageDialogVisible}
					setOpen={setSendBulkVoiceMessageDialogVisible}
					setBulkSendPayload={setBulkSendPayload}
				/>
			</div>
		</Fade>
	);
}

export default Main;
