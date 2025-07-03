import React, { useEffect, useRef, useState } from 'react';
import '../../../../styles/Chat.css';
import { CircularProgress, Zoom } from '@mui/material';
import ChatMessage from '../ChatMessage/ChatMessage';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
	COMMAND_ASSIGN,
	COMMAND_ASSIGN_ALIAS,
	COMMAND_SAVED_RESPONSE,
	COMMAND_SAVED_RESPONSE_ALIAS,
	COMMAND_SEARCH,
	COMMAND_SEARCH_ALIAS,
	COMMAND_TEMPLATE,
	COMMAND_TEMPLATE_ALIAS,
	EVENT_TOPIC_CHAT_ASSIGNMENT,
	EVENT_TOPIC_CHAT_MESSAGE_STATUS_CHANGE,
	EVENT_TOPIC_CHAT_TAGGING,
	EVENT_TOPIC_CLEAR_TEXT_MESSAGE_INPUT,
	EVENT_TOPIC_DROPPED_FILES,
	EVENT_TOPIC_EMOJI_PICKER_VISIBILITY,
	EVENT_TOPIC_FOCUS_MESSAGE_INPUT,
	EVENT_TOPIC_FORCE_REFRESH_CHAT,
	EVENT_TOPIC_GO_TO_MSG_ID,
	EVENT_TOPIC_MARKED_AS_RECEIVED,
	EVENT_TOPIC_NEW_CHAT_MESSAGES,
	EVENT_TOPIC_POST_CHAT_MESSAGE_STATUS_CHANGE,
	EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR,
	EVENT_TOPIC_SENT_TEMPLATE_MESSAGE,
	EVENT_TOPIC_UPDATE_PERSON_NAME,
} from '@src/Constants';
import TemplateListWithControls from '@src/components/TemplateListWithControls';
import ChatFooter from '@src/components/ChatFooter';
import ChatHeader from '@src/components/ChatHeader';
import ChatMessageOptionsMenu from '../ChatMessage/ChatMessageOptionsMenu';
import moment from 'moment';
import PubSub from 'pubsub-js';
import MessageDateIndicator from '../MessageDateIndicator';
import {
	generateUniqueID,
	hasInternetConnection,
	isScrollable,
	sortMessagesAsc,
	translateHTMLInputToText,
} from '@src/helpers/Helpers';
import PreviewSendMedia from '../PreviewSendMedia';
import {
	getDroppedFiles,
	handleDragOver,
	prepareSelectedFiles,
} from '@src/helpers/FileHelper';
import SavedResponseList from '../../../SavedResponseList';
import {
	generateTemplateMessagePayload,
	prepareSendFilePayload,
} from '@src/helpers/ChatHelper';
import { clearUserSession, generateCancelToken } from '@src/helpers/ApiHelper';
import {
	getFirstObject,
	getLastObject,
	getObjLength,
} from '@src/helpers/ObjectHelper';
import {
	fromAssignmentEvent,
	fromTaggingEvent,
	generateMessageInternalId,
	getMessageTimestamp,
	getUniqueSender,
	prepareMessageList,
	prepareReactions,
} from '@src/helpers/MessageHelper';
import { isLocalHost } from '@src/helpers/URLHelper';
import {
	getFirstPendingMessageToSend,
	hasFailedPendingMessages,
	setPendingMessageFailed,
} from '@src/helpers/PendingMessagesHelper';
import { getDisplayAssignmentAndTaggingHistory } from '@src/helpers/StorageHelper';
import { useTranslation } from 'react-i18next';
import { addPlus } from '@src/helpers/PhoneNumberHelper';
import { ErrorBoundary } from '@sentry/react';
import axios, { AxiosError, CancelTokenSource } from 'axios';
import { setPreviewMediaObject } from '@src/store/reducers/previewMediaObjectReducer';
import { flushSync } from 'react-dom';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import SendTemplateDialog from '@src/components/SendTemplateDialog';
import useChatAssignmentAPI from '@src/hooks/api/useChatAssignmentAPI';
import useChat from '@src/components/Main/Chat/ChatView/useChat';
// @ts-ignore
import decode from 'unescape';
import { setState } from '@src/store/reducers/UIReducer';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import InteractiveMessageList from '@src/components/InteractiveMessageList';
import QuickReactionsMenu from '@src/components/QuickReactionsMenu';
import ReactionsEmojiPicker from '@src/components/ReactionsEmojiPicker';
import ReactionDetails from '@src/components/ReactionDetails';
import ChosenFileClass from '@src/ChosenFileClass';
import ReactionList from '@src/interfaces/ReactionList';
import ChosenFileList from '@src/interfaces/ChosenFileList';
import { setPendingMessages } from '@src/store/reducers/pendingMessagesReducer';
import { Template } from '@src/types/templates';
import { fetchChat } from '@src/api/chatsApi';
import { Chat } from '@src/types/chats';
import {
	createMessage,
	fetchMessages,
	markAsReceived,
} from '@src/api/messagesApi';
import {
	ChatMessageError,
	CreateMessageRequest,
	Message,
	MessageType,
	WabaPayload,
	WebhookMessageStatus,
} from '@src/types/messages';
import { getUnixTimestamp } from '@src/helpers/DateHelper';
import { retrievePerson } from '@src/api/personsApi';
import { isPersonExpired } from '@src/helpers/PersonHelper';
import { Person } from '@src/types/persons';
import { fetchChatTaggingEvents } from '@src/api/chatTaggingApi';
import { fetchChatAssignmentEvents } from '@src/api/chatAssignmentApi';
import { createMedia } from '@src/api/mediaApi';

const SCROLL_OFFSET = 0;
const SCROLL_LAST_MESSAGE_VISIBILITY_OFFSET = 150;
const SCROLL_TOP_OFFSET_TO_LOAD_MORE = 2000;
const MESSAGES_PER_PAGE = 30;

interface Props {
	createSavedResponse: (value: string) => void;
	contactProvidersData: {
		[key: string]: any;
	};
	retrieveContactData: (personWaId: string, onComplete?: () => void) => void;
	displayNotification: (title: string, body: string, chatWaId: string) => void;
	isChatOnly: boolean;
	setChatTagsVisible: (value: boolean) => void;
	searchMessagesByKeyword: (keyword: string) => void;
	setMessageWithStatuses: (value?: Message) => void;
}

const ChatView: React.FC<Props> = (props) => {
	const {
		isReadOnly,
		isSendingPendingMessages,
		isTemplatesVisible,
		isSavedResponsesVisible,
		isInteractiveMessagesVisible,
	} = useAppSelector((state) => state.UI);

	const pendingMessages = useAppSelector(
		(state) => state.pendingMessages.value
	);

	const newMessages = useAppSelector((state) => state.newMessages.value);

	const { t } = useTranslation();

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();

	const { waId } = useParams();
	const [isLoaded, setLoaded] = useState(false);
	const [isExpired, setExpired] = useState(false);

	const handleIfUnauthorized = (error: AxiosError) => {
		if (error.response?.status === 401) {
			clearUserSession('invalidToken', undefined, navigate);
		}
	};

	const {
		users,
		templates,
		savedResponses,
		messages,
		setMessages,
		reactions,
		setReactions,
		input,
		setInput,
		isTimestampsSame,
		mergeReactionLists,
		fixedDateIndicatorText,
		prepareFixedDateIndicator,
		sanitizeRequestBody,
		displayMessageInChatManually,
		sendMessage,
		queueMessage,
		handleFailedMessage,
	} = useChat({
		waId,
		isLoaded,
		setExpired,
		handleIfUnauthorized,
		MESSAGES_PER_PAGE,
	});

	const [isLoadingMoreMessages, setLoadingMoreMessages] = useState(false);

	const [person, setPerson] = useState<Person>();
	const [chat, setChat] = useState<Chat>();

	const [isScrollButtonVisible, setScrollButtonVisible] = useState(false);
	const [hasOlderMessagesToLoad, setHasOlderMessagesToLoad] = useState(true);

	const [selectedFiles, setSelectedFiles] = useState<FileList>();
	const [accept, setAccept] = useState('');

	const [isPreviewSendMediaVisible, setPreviewSendMediaVisible] =
		useState(false);
	const [previewSendMediaData, setPreviewSendMediaData] =
		useState<ChosenFileList>();

	const [currentNewMessages, setCurrentNewMessages] = useState(0);

	const [isAtBottom, setAtBottom] = useState(false);

	const [lastMessageId, setLastMessageId] = useState<string>();

	const [chosenTemplate, setChosenTemplate] = useState<Template>();
	const [isSendTemplateDialogVisible, setSendTemplateDialogVisible] =
		useState(false);

	const messagesContainer = useRef<HTMLDivElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	const { partialUpdateChatAssignment } = useChatAssignmentAPI();

	useEffect(() => {
		if (waId) {
			props.retrieveContactData(waId);
		}

		// Generate an abort controller
		abortControllerRef.current = new AbortController();

		if (messagesContainer.current) {
			// Scroll to bottom automatically on message
			const observer = new MutationObserver(persistScrollStateOnNewMessage);
			observer.observe(messagesContainer.current, {
				childList: true,
			});
		}

		// Handle files dragged and dropped to sidebar chat
		const handleFilesDropped = function (msg: string, data: any) {
			setSelectedFiles(data);
		};

		// Listen for file drop events
		const handleFilesDroppedEventToken = PubSub.subscribe(
			EVENT_TOPIC_DROPPED_FILES,
			handleFilesDropped
		);

		// Clear input on event
		const clearInputOnEvent = function (msg: string, data: any) {
			clearInput();
		};

		// Listen for clear input events
		const clearInputEventToken = PubSub.subscribe(
			EVENT_TOPIC_CLEAR_TEXT_MESSAGE_INPUT,
			clearInputOnEvent
		);

		// Generate cancel token for verifying phone number
		// It is used when a new chat is started by URL and person does not exist
		verifyPhoneNumberCancelTokenSourceRef.current = generateCancelToken();

		return () => {
			// Cancelling ongoing requests
			abortControllerRef.current?.abort();

			// Cancel verifying phone number
			verifyPhoneNumberCancelTokenSourceRef.current?.cancel();

			// Unsubscribe
			PubSub.unsubscribe(handleFilesDroppedEventToken);
			PubSub.unsubscribe(clearInputEventToken);
		};
	}, []);

	useEffect(() => {
		// Log state changes
		console.log({
			isSendingPendingMessages: isSendingPendingMessages,
			pendingMessages: pendingMessages,
		});

		const sendNextPending = () => {
			const pendingMessageToSend =
				getFirstPendingMessageToSend(pendingMessages);

			if (!pendingMessageToSend) {
				console.warn('No pending messages!');
				return;
			}

			// If first message exists and not failed, start sending
			dispatch(setState({ isSendingPendingMessages: true }));

			const requestBody = pendingMessageToSend.requestBody;
			const successCallback = pendingMessageToSend.successCallback;
			// const errorCallback = pendingMessageToSend.errorCallback;

			// Prepare a custom callback to continue with queue after first one is sent
			const completeCallback = () => {
				// Run original callback of sent message
				pendingMessageToSend.completeCallback?.();

				// Delete sent message from state
				const updatedState = pendingMessages.filter(function (pendingMessage) {
					return pendingMessage.id !== pendingMessageToSend.id;
				});

				// Update state after deleting sent one
				dispatch(setPendingMessages(updatedState));
				dispatch(setState({ isSendingPendingMessages: false }));
			};

			// Use proper method to send message depends on its type
			if (requestBody.type === MessageType.text) {
				sendMessage(
					false,
					undefined,
					requestBody,
					successCallback,
					completeCallback
				);
			} else if (requestBody.type === MessageType.template) {
				sendTemplateMessage(
					false,
					undefined,
					requestBody,
					successCallback,
					completeCallback
				);
			} else if (requestBody.type === MessageType.interactive) {
				sendInteractiveMessage(
					false,
					undefined,
					requestBody,
					successCallback,
					completeCallback
				);
			} else if (pendingMessageToSend.chosenFile) {
				uploadMedia(
					pendingMessageToSend.chosenFile,
					requestBody,
					pendingMessageToSend.formData,
					completeCallback
				);
			}
		};

		// Make sure this is the best place for it
		// If there is no failed message, update state
		// This state is used for prompting user before leaving page
		if (!hasFailedPendingMessages(pendingMessages)) {
			dispatch(setState({ hasFailedMessages: false }));
		}

		// If it is not sending currently and there are pending messages
		if (!isSendingPendingMessages && pendingMessages.length > 0) {
			sendNextPending();
		} else if (pendingMessages.length === 0) {
			dispatch(setState({ isSendingPendingMessages: false }));
		}
	}, [isSendingPendingMessages, pendingMessages]);

	useEffect(() => {
		setLoaded(false);

		// Clear values for next route
		setPerson(undefined);
		setChat(undefined);
		setMessages({});
		setReactions({});
		setHasOlderMessagesToLoad(true);
		dispatch(
			setState({ isTemplatesVisible: false, isSavedResponsesVisible: false })
		);
		setAtBottom(false);
		setInput('');
		setScrollButtonVisible(false);

		setPreviewSendMediaVisible(false);
		setPreviewSendMediaData(undefined);

		dispatch(setPreviewMediaObject(undefined));

		// Close emoji picker
		PubSub.publish(EVENT_TOPIC_EMOJI_PICKER_VISIBILITY, false);

		if (!waId) {
			console.log('waId is empty.');
			return;
		}

		// Load chat
		retrieveChat();

		// Load contact and messages
		doRetrievePerson(true);

		return () => {
			// Cancelling ongoing requests
			abortControllerRef.current?.abort();

			// Generate a new abort controller, because component is not destroyed
			abortControllerRef.current = new AbortController();
		};
	}, [waId]);

	useEffect(() => {
		dispatch(setState({ chosenContact: person }));
	}, [person]);

	const getNewMessagesCount = () => {
		return waId ? newMessages[waId]?.newMessages ?? 0 : 0;
	};

	useEffect(() => {
		const newMessagesCount = getNewMessagesCount();
		if (newMessagesCount > currentNewMessages) {
			setCurrentNewMessages(newMessagesCount);
		}
	}, [waId, newMessages]);

	useEffect(() => {
		const messagesContainerCopy = messagesContainer.current;
		const dateIndicators = messagesContainerCopy?.querySelectorAll(
			'.chat__message__outer > .chat__message__dateContainer > .chat__message__dateContainer__indicator'
		);

		// To optimize scroll event
		let debounceTimer: NodeJS.Timeout;

		// Consider replacing this with IntersectionObserver
		// Browser support should be considered: https://caniuse.com/intersectionobserver
		function handleScroll(e: Event | React.UIEvent<HTMLElement>) {
			if (debounceTimer) {
				window.clearTimeout(debounceTimer);
			}

			debounceTimer = setTimeout(function () {
				const el = e.target as HTMLElement;

				if (isScrollable(el)) {
					if (!canSeeLastMessage(el)) {
						setScrollButtonVisible(true);
					} else if (isAtBottom) {
						setScrollButtonVisible(false);

						if (currentNewMessages > 0) {
							const lastMessage = getLastObject(messages);
							if (lastMessage) {
								doMarkAsReceived(getMessageTimestamp(lastMessage) ?? -1);
							}
						}
					}

					if (
						el.scrollTop <= SCROLL_TOP_OFFSET_TO_LOAD_MORE &&
						hasOlderMessagesToLoad
					) {
						//console.log("Scrolled to top");
						if (isLoaded && !isLoadingMoreMessages) {
							setLoadingMoreMessages(true);
							listMessages(
								false,
								undefined,
								getMessageTimestamp(getFirstObject(messages))
							);
						}
					} else {
						// TODO: Make sure user scrolls
						if (
							el.scrollHeight - el.scrollTop - el.clientHeight <
							SCROLL_TOP_OFFSET_TO_LOAD_MORE
						) {
							//console.log('Scrolled to bottom');
							if (isLoaded && !isLoadingMoreMessages && !isAtBottom) {
								setLoadingMoreMessages(true);
								listMessages(
									false,
									undefined,
									undefined,
									undefined,
									getMessageTimestamp(getLastObject(messages)),
									true,
									false
								);
							}
						}
					}
				}

				// Second part, to display date
				if (isLoaded) {
					prepareFixedDateIndicator(dateIndicators, el);
				}
			}, 100);
		}

		if (messagesContainer && isLoaded) {
			messagesContainerCopy?.addEventListener('scroll', handleScroll);

			// Display fixed date indicator
			prepareFixedDateIndicator(dateIndicators, messagesContainerCopy);
		}

		return () => {
			clearTimeout(debounceTimer);
			messagesContainerCopy?.removeEventListener('scroll', handleScroll);
		};
	}, [
		messages,
		isLoaded,
		isLoadingMoreMessages,
		isAtBottom,
		currentNewMessages,
		hasOlderMessagesToLoad,
	]);

	useEffect(() => {
		// New messages
		const onNewMessages = function (msg: string, data: ChatMessageList) {
			if (data && isLoaded) {
				flushSync(() => {
					let hasAnyIncomingMsg = false;

					setMessages((prevState) => {
						let newState;
						const preparedMessages: ChatMessageList = {};
						Object.entries(data).forEach((messageEntry) => {
							const messageWabaId = messageEntry[0];
							const message = messageEntry[1];

							if (waId === message?.customer_wa_id) {
								// Replace message displayed with internal id
								const internalIdString = generateMessageInternalId(message.id);
								if (internalIdString in prevState) {
									delete prevState[internalIdString];
								}

								preparedMessages[messageWabaId] = message;

								if (!message.from_us) {
									hasAnyIncomingMsg = true;
								}
							}
						});

						if (getObjLength(preparedMessages) > 0) {
							const lastMessage = getLastObject(preparedMessages) as Message;

							if (isAtBottom) {
								const prevScrollTop = messagesContainer.current?.scrollTop;
								const prevScrollHeight =
									messagesContainer.current?.scrollHeight;
								const isCurrentlyLastMessageVisible = isLastMessageVisible();

								newState = { ...prevState, ...preparedMessages };

								if (!isCurrentlyLastMessageVisible) {
									persistScrollStateFromBottom(
										prevScrollHeight,
										prevScrollTop,
										0
									);
									displayScrollButton();
								}

								if (hasAnyIncomingMsg) {
									const lastMessageTimestamp = getMessageTimestamp(lastMessage);

									// Mark new message as received if visible
									if (canSeeLastMessage(messagesContainer.current)) {
										doMarkAsReceived(lastMessageTimestamp ?? -1);
									} else {
										setCurrentNewMessages((prevState) => prevState + 1);
									}

									// Update contact
									setPerson(
										(prevState) =>
											({
												...prevState,
												last_message_timestamp: lastMessageTimestamp,
											} as Person)
									);

									// Chat is not expired anymore
									setExpired(false);
								}
							} else {
								setCurrentNewMessages((prevState) => prevState + 1);
							}

							// Update last message id
							setLastMessageId(lastMessage.waba_payload?.id ?? lastMessage.id);
						}

						return newState ?? prevState;
					});

					// Reactions
					const preparedReactions = prepareReactions(data);
					setReactions((prevState) =>
						mergeReactionLists(prevState, preparedReactions)
					);
				});
			}
		};

		const newChatMessagesEventToken = PubSub.subscribe(
			EVENT_TOPIC_NEW_CHAT_MESSAGES,
			onNewMessages
		);

		// Status changes
		const onMessageStatusChange = function (
			msg: string,
			data: { [key: string]: WebhookMessageStatus }
		) {
			if (data && isLoaded) {
				let receivedNewErrors = false;
				const prevScrollTop = messagesContainer.current?.scrollTop;
				const prevScrollHeight = messagesContainer.current?.scrollHeight;

				flushSync(() => {
					setMessages((prevState) => {
						const newState = prevState;
						let changedAny = false;

						Object.entries(data).forEach((statusEntry) => {
							let wabaIdOrGetchatId = statusEntry[0];
							const statusObj = statusEntry[1];

							// Check if status data belongs to active chat
							if (statusObj.recipient_id !== waId) return;

							// Check if any message is displayed with internal id
							// Fix duplicated messages in this way
							const internalIdString = generateMessageInternalId(
								statusObj?.getchat_id
							);

							if (internalIdString in newState) {
								wabaIdOrGetchatId = internalIdString;
							}

							if (wabaIdOrGetchatId in newState) {
								// Making message mutable
								newState[wabaIdOrGetchatId] = {
									...newState[wabaIdOrGetchatId],
								};

								if (newState[wabaIdOrGetchatId].waba_statuses) {
									// Making waba_statuses mutable
									newState[wabaIdOrGetchatId].waba_statuses = {
										...newState[wabaIdOrGetchatId].waba_statuses,
									};
								} else {
									// Creating missing waba_statuses
									newState[wabaIdOrGetchatId].waba_statuses = {};
								}

								if (statusObj.status === 'sent') {
									changedAny = true;
									newState[wabaIdOrGetchatId].waba_statuses!.sent = parseInt(
										statusObj.timestamp
									);
								}

								if (statusObj.status === 'delivered') {
									changedAny = true;
									newState[wabaIdOrGetchatId].waba_statuses!.delivered =
										parseInt(statusObj.timestamp);
								}

								if (statusObj.status === 'read') {
									changedAny = true;
									newState[wabaIdOrGetchatId].waba_statuses!.read = parseInt(
										statusObj.timestamp
									);
								}

								if (statusObj.errors) {
									receivedNewErrors = true;
									changedAny = true;
									newState[wabaIdOrGetchatId].is_failed = true;

									// Make data mutable
									if (newState[wabaIdOrGetchatId].waba_payload) {
										newState[wabaIdOrGetchatId].waba_payload = {
											...newState[wabaIdOrGetchatId].waba_payload,
										} as WabaPayload;

										// Update errors data
										newState[wabaIdOrGetchatId].waba_payload!.errors = [
											...(newState[wabaIdOrGetchatId].waba_payload!.errors ??
												[]),
											...statusObj.errors,
										];
									}
								}

								// Notify MessageStatuses component
								PubSub.publish(
									EVENT_TOPIC_POST_CHAT_MESSAGE_STATUS_CHANGE,
									newState[wabaIdOrGetchatId]
								);
							}
						});

						if (changedAny) {
							return { ...newState };
						} else {
							return prevState;
						}
					});
				});

				if (receivedNewErrors) {
					persistScrollStateFromBottom(prevScrollHeight, prevScrollTop, 0);
				}
			}
		};

		const chatMessageStatusChangeEventToken = PubSub.subscribe(
			EVENT_TOPIC_CHAT_MESSAGE_STATUS_CHANGE,
			onMessageStatusChange
		);

		const addMessagesData = (data: ChatMessageList) => {
			if (isAtBottom) {
				const prevScrollTop = messagesContainer.current?.scrollTop;
				const prevScrollHeight = messagesContainer.current?.scrollHeight;
				const isCurrentlyLastMessageVisible = isLastMessageVisible();

				// Display as a new message
				flushSync(() => {
					setMessages((prevState) => {
						return { ...prevState, ...data };
					});
				});

				if (!isCurrentlyLastMessageVisible) {
					persistScrollStateFromBottom(prevScrollHeight, prevScrollTop, 0);
					displayScrollButton();
				}
			} else {
				displayScrollButton();
			}
		};

		// Chat assignment
		const onChatAssignment = function (
			msg: string,
			data: { [key: string]: Message }
		) {
			// This event always has a single message
			const prepared = getFirstObject(data) as Message;
			if (waId === prepared.customer_wa_id) {
				addMessagesData(data);

				// Reload chat to update assignee information
				retrieveChat();
			}
		};

		const chatAssignmentEventToken = PubSub.subscribe(
			EVENT_TOPIC_CHAT_ASSIGNMENT,
			onChatAssignment
		);

		// Chat tagging
		const onChatAssignmentOrChatTagging = function (
			msg: string,
			data: { [key: string]: Message }
		) {
			// This event always has a single message
			const prepared = getFirstObject(data) as Message;
			if (waId === prepared.customer_wa_id) {
				addMessagesData(data);
			}
		};

		const chatTaggingEventToken = PubSub.subscribe(
			EVENT_TOPIC_CHAT_TAGGING,
			onChatAssignmentOrChatTagging
		);

		// Refresh chat/messages when displaying assignment and tagging history is toggled
		const onForceRefreshChat = function (msg: string, data: any) {
			if (waId) {
				// Clear existing messages
				flushSync(() => {
					setMessages({});
				});
				setLoaded(false);

				// This method triggers loading messages with proper callback
				doRetrievePerson(true);
			}
		};

		const forceRefreshChatEventToken = PubSub.subscribe(
			EVENT_TOPIC_FORCE_REFRESH_CHAT,
			onForceRefreshChat
		);

		return () => {
			PubSub.unsubscribe(newChatMessagesEventToken);
			PubSub.unsubscribe(chatMessageStatusChangeEventToken);
			PubSub.unsubscribe(chatAssignmentEventToken);
			PubSub.unsubscribe(chatTaggingEventToken);
			PubSub.unsubscribe(forceRefreshChatEventToken);
		};
	}, [
		waId,
		isLoaded,
		/*isLoadingMoreMessages,*/ isExpired,
		isAtBottom,
		currentNewMessages,
	]);

	useEffect(() => {
		const hasNewerToLoad =
			lastMessageId === undefined || !messages.hasOwnProperty(lastMessageId); //(previous != null && typeof previous !== typeof undefined);
		//console.log("Has newer to load:", hasNewerToLoad);
		setAtBottom(!hasNewerToLoad);
	}, [messages, lastMessageId]);

	useEffect(() => {
		const onUpdatePersonName = function (msg: string, data: any) {
			const name = data;
			setPerson((prevState) => {
				if (prevState) {
					return {
						...prevState,
						name: name,
					} as Person;
				} else {
					return prevState;
				}
			});
		};

		const updatePersonNameTokenEventToken = PubSub.subscribe(
			EVENT_TOPIC_UPDATE_PERSON_NAME,
			onUpdatePersonName
		);

		return () => {
			PubSub.unsubscribe(updatePersonNameTokenEventToken);
		};
	}, [person]);

	const isLastMessageVisible = () => {
		const element = messagesContainer.current;
		if (!element) return false;
		return (
			element.scrollHeight - element.scrollTop - element.clientHeight <
			SCROLL_LAST_MESSAGE_VISIBILITY_OFFSET
		);
	};

	const canSeeLastMessage = (element: HTMLElement | undefined | null) => {
		if (!element) return false;
		return !(
			element.scrollHeight - element.scrollTop - element.clientHeight >
			SCROLL_LAST_MESSAGE_VISIBILITY_OFFSET
		);
	};

	const displayScrollButton = () => {
		setScrollButtonVisible(true);
	};

	const handleScrollButtonClick = () => {
		if (isAtBottom) {
			const el = messagesContainer.current;
			el?.scroll({
				top: el.scrollHeight - el.offsetHeight - SCROLL_OFFSET,
				behavior: 'smooth',
			});
		} else {
			listMessages(
				false,
				undefined,
				undefined,
				undefined,
				undefined,
				false,
				true
			);
		}

		//setScrollButtonVisible(false);
	};

	const persistScrollStateOnNewMessage = () => {
		const target = messagesContainer.current;
		if (target && canSeeLastMessage(target)) {
			target.scroll({
				top: target.scrollHeight - target.offsetHeight - SCROLL_OFFSET,
			});
		}
	};

	const persistScrollStateFromBottom = (
		prevScrollHeight: number | undefined,
		prevScrollTop: number | undefined,
		offset: number | undefined
	) => {
		if (messagesContainer.current) {
			const nextScrollHeight = messagesContainer.current.scrollHeight;
			messagesContainer.current.scrollTop =
				nextScrollHeight -
				(prevScrollHeight ?? 0) +
				(prevScrollTop ?? 0) -
				(offset ?? 0);
		}
	};

	const scrollToChild = (msgId: string) => {
		setTimeout(function () {
			const child: HTMLElement | undefined | null =
				messagesContainer.current?.querySelector('#message_' + msgId);
			let _offset = 25;
			if (child) {
				let targetOffsetTop = child.offsetTop - _offset;
				if (targetOffsetTop < SCROLL_OFFSET) targetOffsetTop = SCROLL_OFFSET;
				messagesContainer.current?.scroll({
					top: targetOffsetTop,
					behavior: 'smooth',
				});

				child.classList.add('blink');

				setTimeout(function () {
					if (child) {
						child.classList.remove('blink');
					}
				}, 1000);
			}
		}, 100);
	};

	const goToMessageId = (
		msgId: string | undefined | null,
		timestamp: number
	) => {
		if (messagesContainer.current) {
			if (msgId) {
				if (messages[msgId]) {
					console.log('This message is already loaded.');
					scrollToChild(msgId);
				} else {
					console.log('This message will be loaded.');

					// TODO: Cancel other messages requests first

					// Load messages since clicked results
					setLoadingMoreMessages(true);
					const callback = () => {
						scrollToChild(msgId);
					};
					listMessages(
						false,
						callback,
						undefined,
						undefined,
						timestamp - 1, // That calculation fixes loading message
						true,
						true
					);
				}
			}
		}
	};

	useEffect(() => {
		const onGoToMessageId = function (msg: string, data: Message) {
			const msgId = data.id;
			const timestamp = getMessageTimestamp(data);

			goToMessageId(msgId, timestamp ?? -1);
		};

		// Subscribe for scrolling to message event
		const token = PubSub.subscribe(EVENT_TOPIC_GO_TO_MSG_ID, onGoToMessageId);

		return () => {
			// Unsubscribe
			PubSub.unsubscribe(token);
		};
	}, [messages, isAtBottom]);

	const handleChosenFiles = () => {
		if (selectedFiles && getObjLength(selectedFiles) > 0) {
			const preparedFiles = prepareSelectedFiles(selectedFiles);

			setPreviewSendMediaData(preparedFiles);
			setPreviewSendMediaVisible(true);
		}
	};

	useEffect(() => {
		if (selectedFiles) {
			handleChosenFiles();
		}
	}, [selectedFiles]);

	const [optionsChatMessage, setOptionsChatMessage] = useState<Message>();
	const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>();
	const [quickReactionAnchorEl, setQuickReactionAnchorEl] =
		useState<HTMLElement>();
	const [reactionsEmojiPickerAnchorEl, setReactionsEmojiPickerAnchorEl] =
		useState<HTMLElement>();
	const [reactionDetailsAnchorEl, setReactionDetailsAnchorEl] =
		useState<HTMLElement>();

	const displayOptionsMenu = (
		event: React.MouseEvent<Element | MouseEvent>,
		chatMessage: Message
	) => {
		// We need to use parent because menu view gets hidden
		setMenuAnchorEl(event.currentTarget as HTMLElement);
		setOptionsChatMessage(chatMessage);
	};

	const displayQuickReactions = (
		event: React.MouseEvent<Element | MouseEvent>,
		chatMessage: Message
	) => {
		setQuickReactionAnchorEl(event.currentTarget as HTMLElement);
		setOptionsChatMessage(chatMessage);
	};

	const displayReactionDetails = (
		event: React.MouseEvent<Element | MouseEvent>,
		chatMessage: Message
	) => {
		setReactionDetailsAnchorEl(event.currentTarget as HTMLElement);
		setOptionsChatMessage(chatMessage);
	};

	const retrieveChat = async () => {
		if (!waId) return;
		try {
			const data = await fetchChat(waId);
			setChat(data);
		} catch (error) {
			console.error(error);
		}
	};

	const doRetrievePerson = async (loadMessages: boolean) => {
		try {
			const data = await retrievePerson(
				waId ?? '',
				abortControllerRef.current?.signal
			);
			setPerson(data);
			setExpired(isPersonExpired(data));

			// PersonView information is loaded, now load messages
			if (loadMessages) {
				listMessages(true, function (preparedMessages: ChatMessageList) {
					const lastPreparedMessage = getLastObject(
						preparedMessages
					) as Message;
					setLastMessageId(
						lastPreparedMessage?.waba_payload?.id ??
							generateMessageInternalId(lastPreparedMessage?.id)
					);

					// Scroll to message if goToMessageId is defined
					const goToMessage = location.state?.goToMessage as
						| Message
						| undefined;
					if (goToMessage !== undefined) {
						goToMessageId(
							goToMessage.id,
							getMessageTimestamp(goToMessage) ?? -1
						);
					}
				});
			}
		} catch (error: any | AxiosError) {
			if (error.response?.status === 404) {
				if (location.state.person) {
					createPersonAndStartChat(
						location.state.person.name,
						location.state.person.initials
					);
				} else {
					// To prevent missing data on refresh
					//closeChat();

					createPersonAndStartChat(addPlus(waId), waId?.[0]);
				}
			} else {
				window.displayError(error);
			}
		}
	};

	let verifyPhoneNumberCancelTokenSourceRef = useRef<CancelTokenSource>();

	const createPersonAndStartChat = (name: string, initials?: string) => {
		const preparedPerson: Person = {
			waba_payload: {
				profile: {
					name: name,
				},
				wa_id: waId ?? '',
			},
			initials: initials ?? '',
			wa_id: waId ?? '',
			last_message_timestamp: -1,
		};

		setPerson(preparedPerson);

		setExpired(true);
		setLoaded(true);
		setLoadingMoreMessages(false);
		setAtBottom(true);
	};

	const listMessages = async (
		isInitial: boolean,
		callback?: (preparedMessages: ChatMessageList) => void,
		beforeTime?: number,
		offset?: number,
		sinceTime?: number,
		isInitialWithSinceTime?: boolean,
		replaceAll?: boolean
	) => {
		console.log('Loading messages...');

		if (replaceAll) {
			setHasOlderMessagesToLoad(true);
		} else {
			// If loading older messages
			if (beforeTime && getObjLength(messages) > 0) {
				// If there are messages more than MESSAGES_PER_PAGE with same timestamp
				if (isTimestampsSame()) beforeTime -= 1;
			}

			// If loading newer messages
			if (sinceTime && getObjLength(messages) >= MESSAGES_PER_PAGE) {
				// If there are messages more than MESSAGES_PER_PAGE with same timestamp
				if (isTimestampsSame(true)) sinceTime += 1;
			}
		}

		try {
			const data = await fetchMessages(
				{
					wa_id: waId ?? '',
					limit: MESSAGES_PER_PAGE,
					offset: offset ?? 0,
					before_time: beforeTime,
					since_time: sinceTime,
				},
				abortControllerRef.current?.signal
			);

			if (sinceTime && isInitialWithSinceTime === true) {
				if (data.next) {
					/*count > limit*/
					setAtBottom(false);
					await listMessages(
						false,
						callback,
						beforeTime,
						data.count - MESSAGES_PER_PAGE,
						sinceTime,
						false,
						replaceAll
					);
					return false;
				}
			}

			const preparedMessages = prepareMessageList(data.results);
			const preparedReactions = prepareReactions(preparedMessages);

			const lastMessage = getFirstObject(preparedMessages) as Message;

			// Pagination filters for events
			let beforeTimeForEvents = beforeTime;
			let sinceTimeForEvents = sinceTime;

			if (isInitial) {
				beforeTimeForEvents = undefined;
			} else {
				if (!beforeTime) {
					beforeTimeForEvents = getMessageTimestamp(lastMessage);
				}
			}

			if (!sinceTime) {
				const firstMessage = getLastObject(preparedMessages) as Message;
				sinceTimeForEvents = getMessageTimestamp(firstMessage);
			}

			// List assignment and tagging history depends on user choice
			if (getDisplayAssignmentAndTaggingHistory()) {
				// List assignment events
				await listChatAssignmentEvents(
					preparedMessages,
					preparedReactions,
					isInitial,
					callback,
					replaceAll,
					beforeTime,
					sinceTime,
					beforeTimeForEvents,
					sinceTimeForEvents
				);
			} else {
				await finishLoadingMessages(
					preparedMessages,
					preparedReactions,
					isInitial,
					callback,
					replaceAll,
					beforeTime,
					sinceTime
				);
			}
		} catch (error: any | AxiosError) {
			setLoadingMoreMessages(false);

			if (isInitial && !axios.isCancel(error)) {
				window.displayCustomError('Failed to load messages!');
			}
		}
	};

	// Chain: listMessages -> listChatAssignmentEvents -> listChatTaggingEvents -> finishLoadingMessages
	const finishLoadingMessages = async (
		preparedMessages: ChatMessageList,
		preparedReactions: ReactionList,
		isInitial: boolean,
		callback?: (messages: ChatMessageList) => void,
		replaceAll?: boolean,
		beforeTime?: number,
		sinceTime?: number
	) => {
		// Sort prepared messages
		preparedMessages = sortMessagesAsc(preparedMessages);

		if (getObjLength(preparedMessages) > 0) {
			// To persist scroll position, we store current scroll information
			const prevScrollTop = messagesContainer.current?.scrollTop;
			const prevScrollHeight = messagesContainer.current?.scrollHeight;

			flushSync(() => {
				setMessages((prevState) => {
					let nextState;
					if (replaceAll) {
						nextState = preparedMessages;
					} else {
						if (sinceTime) {
							nextState = { ...prevState, ...preparedMessages };
						} else {
							nextState = { ...preparedMessages, ...prevState };
						}
					}

					// Sort final object
					return sortMessagesAsc(nextState);
				});

				// Reactions
				setReactions((prevState) => {
					if (replaceAll) {
						return preparedReactions;
					} else {
						return mergeReactionLists(prevState, preparedReactions);
					}
				});
			});

			if (!sinceTime || replaceAll) {
				persistScrollStateFromBottom(
					prevScrollHeight,
					prevScrollTop,
					SCROLL_OFFSET
				);
			} else if (sinceTime) {
				if (messagesContainer.current) {
					messagesContainer.current.scrollTop = prevScrollTop ?? 0;
				}
			}
		} else {
			if (beforeTime) {
				console.log('No more items to load.');
				setHasOlderMessagesToLoad(false);
			}
		}

		setLoaded(true);
		setLoadingMoreMessages(false);

		if (isInitial) {
			// TODO: Check unread messages first and then decide to do it or not
			// beforeTime is not passed only for initial request
			// Mark messages as received
			const lastMessage = getLastObject(preparedMessages);
			const lastMessageTimestamp = getMessageTimestamp(lastMessage);
			doMarkAsReceived(lastMessageTimestamp ?? -1);

			// Auto focus
			PubSub.publish(EVENT_TOPIC_FOCUS_MESSAGE_INPUT);

			// Workaround to fix pagination with too many reactions in response
			// Check number of non-reaction messages loaded initially
			// if less than MESSAGES_PER_PAGE - 10
			// then load more messages
			if (
				Object.entries(preparedMessages).filter(
					(item) => item[1].waba_payload?.type !== MessageType.reaction
				).length <
				MESSAGES_PER_PAGE - 10
			) {
				setLoadingMoreMessages(true);
				await listMessages(
					false,
					undefined,
					getMessageTimestamp(getFirstObject(preparedMessages) as Message)
				);
			}
		}

		// Promise
		if (callback) {
			setTimeout(function () {
				callback(preparedMessages);
			}, 50);
		}
	};

	const listChatAssignmentEvents = async (
		preparedMessages: ChatMessageList,
		preparedReactions: ReactionList,
		isInitial: boolean,
		callback?: (messages: ChatMessageList) => void,
		replaceAll?: boolean,
		beforeTime?: number,
		sinceTime?: number,
		beforeTimeForEvents?: number,
		sinceTimeForEvents?: number
	) => {
		try {
			const data = await fetchChatAssignmentEvents(
				{
					wa_id: waId ?? '',
					before_time: beforeTimeForEvents,
					since_time: sinceTimeForEvents,
				},
				abortControllerRef.current?.signal
			);

			const chatAssignmentEvents: ChatMessageList = {};
			data.results.forEach((assignmentEvent: any) => {
				const prepared = fromAssignmentEvent(assignmentEvent);
				chatAssignmentEvents[prepared.id] = prepared;
			});

			preparedMessages = {
				...preparedMessages,
				...chatAssignmentEvents,
			};

			// List chat tagging events
			await listChatTaggingEvents(
				preparedMessages,
				preparedReactions,
				isInitial,
				callback,
				replaceAll,
				beforeTime,
				sinceTime,
				beforeTimeForEvents,
				sinceTimeForEvents
			);
		} catch (error: any | AxiosError) {
			console.error(error);
		}
	};

	const listChatTaggingEvents = async (
		preparedMessages: ChatMessageList,
		preparedReactions: ReactionList,
		isInitial: boolean,
		callback?: (messages: ChatMessageList) => void,
		replaceAll?: boolean,
		beforeTime?: number,
		sinceTime?: number,
		beforeTimeForEvents?: number,
		sinceTimeForEvents?: number
	) => {
		try {
			const data = await fetchChatTaggingEvents(
				{
					wa_id: waId ?? '',
					before_time: beforeTimeForEvents,
					since_time: sinceTimeForEvents,
				},
				abortControllerRef.current?.signal
			);

			const eventMessages: ChatMessageList = {};
			data.results.forEach((taggingEvent: any) => {
				const prepared = fromTaggingEvent(taggingEvent);
				eventMessages[prepared.id] = prepared;
			});

			preparedMessages = {
				...preparedMessages,
				...eventMessages,
			};

			// Finish loading
			await finishLoadingMessages(
				preparedMessages,
				preparedReactions,
				isInitial,
				callback,
				replaceAll,
				beforeTime,
				sinceTime
			);
		} catch (error: any | AxiosError) {
			console.error(error);
		}
	};

	const sendCustomTextMessage = async (text: string) => {
		if (waId) {
			await sendMessage(true, undefined, {
				wa_id: waId,
				type: MessageType.text,
				text: {
					body: text.trim(),
				},
			});
		} else {
			console.warn('Empty wa_id!');
		}
	};

	const sendReaction = async (messageId: string, emoji: string | null) => {
		if (!emoji) return;

		const requestBody: CreateMessageRequest = {
			wa_id: waId,
			type: MessageType.reaction,
			reaction: {
				message_id: messageId,
				emoji: emoji,
			},
		};

		try {
			await createMessage(requestBody);
		} catch (error: any | AxiosError) {
			if (error.response) {
				const status = error.response.status;
				if (status === 453) {
					setExpired(true);
				}

				handleIfUnauthorized(error);
			}
		}
	};

	const sendTemplateMessage = async (
		willQueue: boolean,
		templateMessage?: Template,
		customPayload?: object,
		successCallback?: () => void,
		completeCallback?: () => void
	) => {
		let requestBody: any = {};

		if (customPayload) {
			requestBody = customPayload;
		} else if (templateMessage) {
			requestBody = generateTemplateMessagePayload(templateMessage);
			requestBody.wa_id = waId;
		}

		if (willQueue) {
			if (!isLoaded) {
				console.warn('Cancelled sending.');
				return;
			}

			queueMessage(requestBody, successCallback, undefined, completeCallback);

			return;
		}

		try {
			const response = await createMessage(sanitizeRequestBody(requestBody));
			// Message is stored and will be sent later
			if (response.status === 202) {
				displayMessageInChatManually(requestBody, response.data.id);
			}
			successCallback?.();

			// Hide dialog by this event
			PubSub.publish(EVENT_TOPIC_SENT_TEMPLATE_MESSAGE, requestBody);
		} catch (error: any | AxiosError) {
			if (error.response) {
				const errors = error.response.data?.waba_response?.errors;
				PubSub.publish(EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR, errors);

				const status = error.response.status;

				if (status === 453) {
					setExpired(true);
				} else if (status >= 500) {
					handleFailedMessage(requestBody);
				}

				handleIfUnauthorized(error);
			}
		} finally {
			completeCallback?.();
		}
	};

	const sendInteractiveMessage = async (
		willQueue: boolean,
		interactiveMessage?: object,
		customPayload?: object,
		successCallback?: () => void,
		completeCallback?: () => void
	) => {
		let requestBody: object;

		if (customPayload) {
			requestBody = customPayload;
		} else {
			requestBody = {
				wa_id: waId,
				type: MessageType.interactive,
				interactive: interactiveMessage,
			};
		}

		if (willQueue) {
			if (!isLoaded) {
				console.warn('Cancelled sending.');
				return;
			}

			queueMessage(requestBody, successCallback, undefined, completeCallback);

			return;
		}

		try {
			const response = await createMessage(sanitizeRequestBody(requestBody));
			// Message is stored and will be sent later
			if (response.status === 202) {
				displayMessageInChatManually(requestBody, response.data.id);
			}

			successCallback?.();
		} catch (error: any | AxiosError) {
			if (error.response) {
				const status = error.response.status;

				if (status === 453) {
					setExpired(true);
				} else if (status >= 500) {
					handleFailedMessage(requestBody);
				}

				handleIfUnauthorized(error);
			}
		} finally {
			completeCallback?.();
		}
	};

	const uploadMedia = async (
		chosenFile: ChosenFileClass,
		payload: any,
		formData: any,
		completeCallback: () => void
	) => {
		// To display a progress
		dispatch(setState({ isUploadingMedia: true }));

		try {
			const data = await createMedia(formData);
			// Convert parameters to a ChosenFile object
			await sendFile(
				payload?.wa_id,
				data.file,
				chosenFile,
				undefined,
				function () {
					completeCallback();
					dispatch(setState({ isUploadingMedia: false }));
				}
			);
		} catch (error: any | AxiosError) {
			console.error(error);
			if (error?.response?.status === 413) {
				window.displayCustomError('The media file is too big to upload!');
			} else {
				window.displayError(error);
			}

			completeCallback();
			dispatch(setState({ isUploadingMedia: false }));
		}
	};

	const sendFile = async (
		receiverWaId: string | undefined,
		fileURL: string | undefined,
		chosenFile: ChosenFileClass | undefined,
		customPayload: object | undefined,
		completeCallback?: () => void
	) => {
		let requestBody: object = {};

		if (customPayload) {
			requestBody = customPayload;
		} else if (chosenFile) {
			requestBody = prepareSendFilePayload(chosenFile, fileURL);
			requestBody = {
				...requestBody,
				wa_id: receiverWaId,
				recipient_type: 'individual',
				to: receiverWaId,
			};
		}

		try {
			const response = await createMessage(sanitizeRequestBody(requestBody));
			// Message is stored and will be sent later
			if (response.status === 202) {
				displayMessageInChatManually(requestBody, response.data.id);
			}

			// Send next request (or resend callback)
			completeCallback?.();
		} catch (error: any | AxiosError) {
			if (error.response) {
				const status = error.response.status;

				if (status === 453) {
					setExpired(true);
				} else if (status >= 500) {
					handleFailedMessage(requestBody);
				}

				handleIfUnauthorized(error);
			}

			// Send next when it fails, a retry can be considered
			// If custom payload is empty, it means it is resending, so it is just a success callback
			if (!customPayload) {
				completeCallback?.();
			}
		}
	};

	const retryMessage = (message: Message) => {
		if (!message.resend_payload) {
			console.warn('Property is undefined: resendPayload', message);
			return;
		}

		message.resend_payload.wa_id = message.waba_payload?.wa_id;

		switch (message.waba_payload?.type) {
			case MessageType.text:
				sendMessage(true, undefined, message.resend_payload);
				break;
			case MessageType.template:
				sendTemplateMessage(true, undefined, message.resend_payload);
				break;
			case MessageType.interactive:
				sendInteractiveMessage(true, undefined, message.resend_payload);
				break;
			default:
				if (
					message.waba_payload?.wa_id &&
					[
						MessageType.audio,
						MessageType.video,
						MessageType.image,
						MessageType.voice,
					].includes(message.waba_payload.type)
				) {
					sendFile(undefined, undefined, undefined, message.resend_payload);
				}
				break;
		}
	};

	const clearInput = () => {
		setInput('');
	};

	const sendHandledChosenFiles = (preparedFiles: ChosenFileList) => {
		if (isLoaded && preparedFiles) {
			// Prepare and queue uploading and sending processes
			Object.entries(preparedFiles).forEach((curFile) => {
				const curChosenFile = curFile[1];
				const file = curChosenFile.file;

				const formData = new FormData();
				formData.append('file_encoded', file);

				const requestBody = {
					wa_id: waId,
				};

				queueMessage(
					requestBody,
					undefined,
					undefined,
					undefined,
					formData,
					curChosenFile
				);
			});
		}
	};

	const handleDrop = (event: React.DragEvent<HTMLElement>) => {
		if (waId) {
			setSelectedFiles(getDroppedFiles(event));
		} else {
			event.preventDefault();
		}
	};

	const doMarkAsReceived = async (timestamp: number) => {
		try {
			await markAsReceived(
				{
					customer_wa_id: waId ?? '',
					timestamp,
				},
				abortControllerRef.current?.signal
			);
			PubSub.publish(EVENT_TOPIC_MARKED_AS_RECEIVED, waId);
			setCurrentNewMessages(0);
		} catch (error: any | AxiosError) {
			console.error(error);
		}
	};

	const closeChat = () => {
		navigate(`/main${location.search}`);
	};

	const processCommand = (text: string) => {
		console.log('Command: ' + text);

		const commandArray = text.split(' ').filter((e) => e);

		const handleTemplateCommand = () => {
			const templateName = commandArray[1] ?? '';
			if (templateName) {
				console.log('Send template: ' + templateName);

				const template = templates[templateName];

				if (template) {
					setChosenTemplate(template);
					setSendTemplateDialogVisible(true);
				} else {
					window.displayCustomError('Template not found!');
				}
			}
		};

		const handleSavedResponseCommand = () => {
			const savedResponseId = commandArray[1]
				? parseInt(commandArray[1])
				: null;
			if (savedResponseId && savedResponseId > 0) {
				console.log('Send saved response: ' + savedResponseId);

				const savedResponse = Object.values(savedResponses).filter(
					(curSavedResponse) => curSavedResponse.id === savedResponseId
				)[0];

				if (savedResponse) {
					sendCustomTextMessage(savedResponse.text);
				} else {
					window.displayCustomError('Saved response not found!');
				}
			}
		};

		const handleAssignCommand = () => {
			const assignedUsername = commandArray[1] ?? '';
			if (assignedUsername) {
				console.log('Assign to: ' + assignedUsername);

				const assignedUserId = Object.values(users).filter(
					(curUser) => curUser.username === assignedUsername
				)[0]?.id;

				if (assignedUserId) {
					partialUpdateChatAssignment(waId, assignedUserId);
				} else {
					window.displayCustomError('User not found!');
				}
			}
		};

		const handleSearchCommand = () => {
			const searchKeyword = commandArray
				.filter((item, index) => index !== 0)
				.join(' ');

			if (searchKeyword.trim().length > 0) {
				props.searchMessagesByKeyword(searchKeyword);
			} else {
				window.displayCustomError('You need to enter a keyword!');
			}
		};

		if (commandArray.length > 0) {
			switch (commandArray[0]) {
				case COMMAND_TEMPLATE:
				case COMMAND_TEMPLATE_ALIAS: {
					handleTemplateCommand();
					break;
				}
				case COMMAND_SAVED_RESPONSE:
				case COMMAND_SAVED_RESPONSE_ALIAS: {
					handleSavedResponseCommand();
					break;
				}
				case COMMAND_ASSIGN:
				case COMMAND_ASSIGN_ALIAS: {
					handleAssignCommand();
					break;
				}
				case COMMAND_SEARCH:
				case COMMAND_SEARCH_ALIAS: {
					handleSearchCommand();
					break;
				}
				default:
					window.displayCustomError('Command not recognized!');
					break;
			}
		}
	};

	let lastPrintedDate: moment.Moment | undefined;
	let lastSenderWaId: string | undefined;

	return (
		<div
			className={
				'chat' +
				(waId ? ' chatOpen' : '') +
				(props.isChatOnly ? ' chatFullWidth' : '')
			}
			onDrop={(event) => handleDrop(event)}
			onDragOver={(event) => handleDragOver(event)}
		>
			{/*<Prompt when={hasFailedMessages}
                    message={confirmationMessage} />*/}

			<ChatHeader
				chat={chat}
				person={person}
				contactProvidersData={props.contactProvidersData}
				isChatOnly={props.isChatOnly}
				setChatTagsVisible={props.setChatTagsVisible}
				closeChat={closeChat}
				waId={waId ?? ''}
			/>

			{/* FOR TESTING QUEUE */}
			{isLocalHost() && pendingMessages.length > 0 && (
				<div className="pendingMessagesIndicator">
					<div>{isSendingPendingMessages.toString()}</div>
					<div>{pendingMessages.length}</div>
				</div>
			)}

			<Zoom
				in={
					isLoaded &&
					!isLoadingMoreMessages &&
					fixedDateIndicatorText !== undefined &&
					fixedDateIndicatorText.trim().length > 0
				}
			>
				<div className="chat__body__dateIndicator">
					<MessageDateIndicator text={fixedDateIndicatorText} />
				</div>
			</Zoom>

			<Zoom in={(waId && !isLoaded) || isLoadingMoreMessages} unmountOnExit>
				<div className="chat__body__loadingMore">
					<div className="chat__body__loadingMore__wrapper">
						<CircularProgress size={28} />
					</div>
				</div>
			</Zoom>

			<div
				id="chat__body"
				className="chat__body"
				ref={messagesContainer}
				onDrop={(event) => event.preventDefault()}
			>
				<div className="chat__empty" />

				{Object.entries(messages).map((message, index) => {
					// Ignoring reaction messages
					if (message[1].waba_payload?.type === MessageType.reaction) return;

					// Message date is created here and passed to ChatMessage for a better performance
					const curMsgDate = moment.unix(getMessageTimestamp(message[1]) ?? -1);

					if (index === 0) {
						lastPrintedDate = undefined;
						lastSenderWaId = undefined;
					}

					let willDisplayDate = false;
					if (lastPrintedDate === undefined) {
						willDisplayDate = true;
						lastPrintedDate = moment.unix(
							getMessageTimestamp(message[1]) ?? -1
						);
					} else {
						if (!curMsgDate.isSame(lastPrintedDate, 'day')) {
							willDisplayDate = true;
						}

						lastPrintedDate = curMsgDate;
					}

					let willDisplaySender = false;
					const curSenderWaId = getUniqueSender(message[1]);
					if (lastSenderWaId === undefined) {
						willDisplaySender = true;
						lastSenderWaId = getUniqueSender(message[1]);
					} else {
						if (lastSenderWaId !== curSenderWaId) {
							willDisplaySender = true;
						}

						lastSenderWaId = getUniqueSender(message[1]);
					}

					return (
						<ErrorBoundary key={message[0]}>
							<ChatMessage
								data={message[1]}
								reactionsHistory={reactions[message[0]] ?? []}
								templateData={
									templates[message[1]?.waba_payload?.template?.name ?? '']
								}
								displaySender={willDisplaySender}
								displayDate={willDisplayDate}
								isExpired={isExpired}
								goToMessageId={goToMessageId}
								retryMessage={retryMessage}
								onOptionsClick={displayOptionsMenu}
								onQuickReactionsClick={displayQuickReactions}
								onReactionDetailsClick={displayReactionDetails}
								contactProvidersData={props.contactProvidersData}
								setMessageWithStatuses={props.setMessageWithStatuses}
								isActionsEnabled={true}
							/>
						</ErrorBoundary>
					);
				})}

				<div className="chat__body__empty" />
			</div>

			<QuickReactionsMenu
				message={optionsChatMessage}
				anchorElement={quickReactionAnchorEl}
				setAnchorElement={setQuickReactionAnchorEl}
				setEmojiPickerAnchorElement={setReactionsEmojiPickerAnchorEl}
				onReaction={sendReaction}
			/>

			<ReactionsEmojiPicker
				message={optionsChatMessage}
				anchorElement={reactionsEmojiPickerAnchorEl}
				setAnchorElement={setReactionsEmojiPickerAnchorEl}
				onReaction={sendReaction}
			/>

			<ReactionDetails
				message={optionsChatMessage}
				reactionsHistory={
					optionsChatMessage
						? reactions[
								optionsChatMessage.waba_payload?.id ?? optionsChatMessage.id
						  ] ?? []
						: []
				}
				anchorElement={reactionDetailsAnchorEl}
				setAnchorElement={setReactionDetailsAnchorEl}
			/>

			{isTemplatesVisible && (
				<TemplateListWithControls
					onSelect={(template: Template) => {
						setChosenTemplate(template);
						setSendTemplateDialogVisible(true);
					}}
				/>
			)}

			{isInteractiveMessagesVisible && (
				<InteractiveMessageList
					onSend={(interactiveMessage) =>
						sendInteractiveMessage(true, interactiveMessage)
					}
				/>
			)}

			<SendTemplateDialog
				isVisible={isSendTemplateDialogVisible}
				setVisible={setSendTemplateDialogVisible}
				chosenTemplate={chosenTemplate}
				onSend={(templateMessage) => sendTemplateMessage(true, templateMessage)}
				sendCallback={() => dispatch(setState({ isTemplatesVisible: false }))}
			/>

			{isSavedResponsesVisible && (
				<SavedResponseList sendCustomTextMessage={sendCustomTextMessage} />
			)}

			{!isReadOnly && (
				<ChatFooter
					waId={waId}
					currentNewMessages={currentNewMessages}
					isExpired={isExpired}
					input={input}
					setInput={setInput}
					sendMessage={sendMessage}
					setSelectedFiles={setSelectedFiles}
					accept={accept}
					sendHandledChosenFiles={sendHandledChosenFiles}
					setAccept={setAccept}
					isScrollButtonVisible={isScrollButtonVisible}
					handleScrollButtonClick={handleScrollButtonClick}
					processCommand={processCommand}
				/>
			)}

			{!waId && (
				<div className="chat__default">
					<h2>{t('Hey')}</h2>
					<p>{t('Choose a contact to start a conversation')}</p>
				</div>
			)}

			<ChatMessageOptionsMenu
				menuAnchorEl={menuAnchorEl}
				setMenuAnchorEl={setMenuAnchorEl}
				optionsChatMessage={optionsChatMessage}
				createSavedResponse={props.createSavedResponse}
			/>

			{isPreviewSendMediaVisible && (
				<PreviewSendMedia
					data={previewSendMediaData}
					setData={setPreviewSendMediaData}
					setPreviewSendMediaVisible={setPreviewSendMediaVisible}
					sendHandledChosenFiles={sendHandledChosenFiles}
				/>
			)}
		</div>
	);
};

export default ChatView;
