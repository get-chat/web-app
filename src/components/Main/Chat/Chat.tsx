// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import '../../../styles/Chat.css';
import { CircularProgress, Zoom } from '@mui/material';
import ChatMessage from './ChatMessage/ChatMessage';
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
import ChatMessageModel from '../../../api/models/ChatMessageModel';
import PersonModel from '../../../api/models/PersonModel';
import TemplateListWithControls from '@src/components/TemplateListWithControls';
import ChatFooter from '@src/components/ChatFooter';
import ChatHeader from '@src/components/ChatHeader';
import ChatMessageOptionsMenu from './ChatMessage/ChatMessageOptionsMenu';
import moment from 'moment';
import PubSub from 'pubsub-js';
import MessageDateIndicator from './MessageDateIndicator';
import {
	generateUniqueID,
	generateUnixTimestamp,
	hasInternetConnection,
	isScrollable,
	sortMessagesAsc,
	translateHTMLInputToText,
} from '@src/helpers/Helpers';
import PreviewSendMedia from './PreviewSendMedia';
import {
	getDroppedFiles,
	handleDragOver,
	prepareSelectedFiles,
} from '@src/helpers/FileHelper';
import SavedResponseList from '../../SavedResponseList';
import {
	generateTemplateMessagePayload,
	prepareSendFilePayload,
} from '@src/helpers/ChatHelper';
import { isMobileOnly } from 'react-device-detect';
import { clearUserSession, generateCancelToken } from '@src/helpers/ApiHelper';
import {
	getFirstObject,
	getLastObject,
	getObjLength,
} from '@src/helpers/ObjectHelper';
import {
	extractTimestampFromMessage,
	messageHelper,
} from '@src/helpers/MessageHelper';
import { isLocalHost } from '@src/helpers/URLHelper';
import {
	getFirstPendingMessageToSend,
	hasFailedPendingMessages,
	setPendingMessageFailed,
} from '@src/helpers/PendingMessagesHelper';
import { getDisplayAssignmentAndTaggingHistory } from '@src/helpers/StorageHelper';
import { useTranslation } from 'react-i18next';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { addPlus, prepareWaId } from '@src/helpers/PhoneNumberHelper';
import { ErrorBoundary } from '@sentry/react';
import ChatMessagesResponse from '../../../api/responses/ChatMessagesResponse';
import ChatAssignmentEventsResponse from '../../../api/responses/ChatAssignmentEventsResponse';
import ChatTaggingEventsResponse from '../../../api/responses/ChatTaggingEventsResponse';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { setPreviewMediaObject } from '@src/store/reducers/previewMediaObjectReducer';
import { flushSync } from 'react-dom';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import SendTemplateDialog from '@src/components/SendTemplateDialog';
import TemplateModel from '@src/api/models/TemplateModel';
import useChatAssignmentAPI from '@src/hooks/api/useChatAssignmentAPI';
import useChat from '@src/components/Main/Chat/useChat';
import ChatModel from '@src/api/models/ChatModel';
import decode from 'unescape';
import {
	setBulkSend,
	setSelectionModeEnabled,
} from '@src/store/reducers/UIReducer';

const SCROLL_OFFSET = 0;
const SCROLL_LAST_MESSAGE_VISIBILITY_OFFSET = 150;
const SCROLL_TOP_OFFSET_TO_LOAD_MORE = 2000;
const MESSAGES_PER_PAGE = 30;

const Chat: React.FC = (props) => {
	const { apiService } = React.useContext(ApplicationContext);

	const { isReadOnly } = useAppSelector((state) => state.UI.value);

	const { t } = useTranslation();

	const dispatch = useAppDispatch();

	const {
		currentUser,
		users,
		templates,
		savedResponses,
		messages,
		setMessages,
		isTimestampsSame,
	} = useChat({
		MESSAGES_PER_PAGE,
	});

	const [fixedDateIndicatorText, setFixedDateIndicatorText] = useState();
	const [isLoaded, setLoaded] = useState(false);
	const [isLoadingMoreMessages, setLoadingMoreMessages] = useState(false);
	const [isExpired, setExpired] = useState(false);
	const [isTemplatesVisible, setTemplatesVisible] = useState(false);
	const [isSavedResponsesVisible, setSavedResponsesVisible] = useState(false);

	const [person, setPerson] = useState();
	const [chat, setChat] = useState<ChatModel>();

	const [input, setInput] = useState('');
	const [isScrollButtonVisible, setScrollButtonVisible] = useState(false);
	const [hasOlderMessagesToLoad, setHasOlderMessagesToLoad] = useState(true);

	const [selectedFiles, setSelectedFiles] = useState();
	const [accept, setAccept] = useState('');

	const [isPreviewSendMediaVisible, setPreviewSendMediaVisible] =
		useState(false);
	const [previewSendMediaData, setPreviewSendMediaData] = useState();

	const [currentNewMessages, setCurrentNewMessages] = useState(0);

	const [isAtBottom, setAtBottom] = useState(false);

	const [lastMessageId, setLastMessageId] = useState();

	const [chosenTemplate, setChosenTemplate] = useState();
	const [isSendTemplateDialogVisible, setSendTemplateDialogVisible] =
		useState(false);

	const messagesContainer = useRef<HTMLElement>(null);
	const cancelTokenSourceRef = useRef();

	const { waId } = useParams();

	const { partialUpdateChatAssignment } = useChatAssignmentAPI();

	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if (waId) {
			props.retrieveContactData(waId);
		}

		// Generate a token
		cancelTokenSourceRef.current = generateCancelToken();

		if (messagesContainer) {
			// Scroll to bottom automatically on message
			const observer = new MutationObserver(persistScrollStateOnNewMessage);
			observer.observe(messagesContainer.current, {
				childList: true,
			});
		}

		// Handle files dragged and dropped to sidebar chat
		const handleFilesDropped = function (msg, data) {
			setSelectedFiles(data);
		};

		// Listen for file drop events
		const handleFilesDroppedEventToken = PubSub.subscribe(
			EVENT_TOPIC_DROPPED_FILES,
			handleFilesDropped
		);

		// Clear input on event
		const clearInputOnEvent = function (msg, data) {
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
			cancelTokenSourceRef.current.cancel();

			// Cancel verifying phone number
			verifyPhoneNumberCancelTokenSourceRef.current.cancel();

			// Unsubscribe
			PubSub.unsubscribe(handleFilesDroppedEventToken);
			PubSub.unsubscribe(clearInputEventToken);
		};
	}, []);

	useEffect(() => {
		const pendingMessages = props.pendingMessages;
		const isSendingPendingMessages = props.isSendingPendingMessages;

		// Keep state in window as a variable to have actual state in callbacks
		window.pendingMessages = pendingMessages;

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
			props.setSendingPendingMessages(true);

			const requestBody = pendingMessageToSend.requestBody;
			const successCallback = pendingMessageToSend.successCallback;
			// const errorCallback = pendingMessageToSend.errorCallback;

			// Prepare a custom callback to continue with queue after first one is sent
			const completeCallback = () => {
				// Run original callback of sent message
				pendingMessageToSend.completeCallback?.();

				// Delete sent message from state
				const updatedState = window.pendingMessages.filter(function (
					pendingMessage
				) {
					return pendingMessage.id !== pendingMessageToSend.id;
				});

				// Update state after deleting sent one
				props.setPendingMessages(updatedState);
				props.setSendingPendingMessages(false);
			};

			// Use proper method to send message depends on its type
			if (requestBody.type === ChatMessageModel.TYPE_TEXT) {
				sendMessage(
					false,
					undefined,
					requestBody,
					successCallback,
					completeCallback
				);
			} else if (requestBody.type === ChatMessageModel.TYPE_TEMPLATE) {
				sendTemplateMessage(
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
		if (!hasFailedPendingMessages(props.pendingMessages)) {
			props.setHasFailedMessages(false);
		}

		// If it is not sending currently and there are pending messages
		if (!isSendingPendingMessages && pendingMessages.length > 0) {
			sendNextPending();
		} else if (pendingMessages.length === 0) {
			props.setSendingPendingMessages(false);
		}
	}, [props.isSendingPendingMessages, props.pendingMessages]);

	useEffect(() => {
		setLoaded(false);

		// Clear values for next route
		setPerson(undefined);
		setChat(undefined);
		setMessages([]);
		setHasOlderMessagesToLoad(true);
		setTemplatesVisible(false);
		setSavedResponsesVisible(false);
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
		retrievePerson(true);

		return () => {
			// Cancelling ongoing requests
			cancelTokenSourceRef.current.cancel();

			// Generate a new token, because component is not destroyed
			cancelTokenSourceRef.current = generateCancelToken();
		};
	}, [waId]);

	useEffect(() => {
		props.setChosenContact(person);
	}, [person]);

	const getNewMessagesCount = () => {
		return props.newMessages[waId]?.newMessages ?? 0;
	};

	useEffect(() => {
		const newMessagesCount = getNewMessagesCount();
		if (newMessagesCount > currentNewMessages) {
			setCurrentNewMessages(newMessagesCount);
		}
	}, [waId, props.newMessages]);

	useEffect(() => {
		const messagesContainerCopy = messagesContainer.current;
		const dateIndicators = messagesContainerCopy.querySelectorAll(
			'.chat__message__outer > .chat__message__dateContainer > .chat__message__dateContainer__indicator'
		);

		// To optimize scroll event
		let debounceTimer;

		// Consider replacing this with IntersectionObserver
		// Browser support should be considered: https://caniuse.com/intersectionobserver
		function handleScroll(e) {
			if (debounceTimer) {
				window.clearTimeout(debounceTimer);
			}

			debounceTimer = setTimeout(function () {
				const el = e.target;

				if (isScrollable(el)) {
					if (!canSeeLastMessage(el)) {
						setScrollButtonVisible(true);
					} else if (isAtBottom) {
						setScrollButtonVisible(false);

						if (currentNewMessages > 0) {
							const lastMessage = getLastObject(messages);
							if (lastMessage) {
								markAsReceived(extractTimestampFromMessage(lastMessage));
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
								getFirstObject(messages)?.timestamp
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
									getLastObject(messages)?.timestamp,
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
			messagesContainerCopy.addEventListener('scroll', handleScroll);

			// Display fixed date indicator
			prepareFixedDateIndicator(dateIndicators, messagesContainerCopy);
		}

		return () => {
			clearTimeout(debounceTimer);
			messagesContainerCopy.removeEventListener('scroll', handleScroll);
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
		const onNewMessages = function (msg, data) {
			if (data && isLoaded) {
				flushSync(() => {
					let hasAnyIncomingMsg = false;

					setMessages((prevState) => {
						let newState;
						const preparedMessages = {};
						Object.entries(data).forEach((message) => {
							const msgId = message[0];
							const chatMessage = message[1];

							if (waId === chatMessage.waId) {
								// Check if any message is displayed with internal id
								// Fix duplicated messages in this way
								const internalIdString = chatMessage.generateInternalIdString();
								if (!(internalIdString in prevState)) {
									preparedMessages[msgId] = chatMessage;
								}

								if (!chatMessage.isFromUs) {
									hasAnyIncomingMsg = true;
								}
							}
						});

						if (getObjLength(preparedMessages) > 0) {
							const lastMessage = getLastObject(preparedMessages);

							if (isAtBottom) {
								const prevScrollTop = messagesContainer.current.scrollTop;
								const prevScrollHeight = messagesContainer.current.scrollHeight;
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
									const lastMessageTimestamp =
										extractTimestampFromMessage(lastMessage);

									// Mark new message as received if visible
									if (canSeeLastMessage(messagesContainer.current)) {
										markAsReceived(lastMessageTimestamp);
									} else {
										setCurrentNewMessages((prevState) => prevState + 1);
									}

									// Update contact
									setPerson((prevState) => ({
										...prevState,
										lastMessageTimestamp: lastMessageTimestamp,
										isExpired: false,
									}));

									// Chat is not expired anymore
									setExpired(false);
								}
							} else {
								setCurrentNewMessages((prevState) => prevState + 1);
							}

							// Update last message id
							setLastMessageId(lastMessage.id);
						}

						return newState ?? prevState;
					});
				});
			}
		};

		const newChatMessagesEventToken = PubSub.subscribe(
			EVENT_TOPIC_NEW_CHAT_MESSAGES,
			onNewMessages
		);

		// Status changes
		const onMessageStatusChange = function (msg, data) {
			if (data && isLoaded) {
				// TODO: Check if message belongs to active conversation to avoid doing this unnecessarily

				let receivedNewErrors = false;
				const prevScrollTop = messagesContainer.current.scrollTop;
				const prevScrollHeight = messagesContainer.current.scrollHeight;

				flushSync(() => {
					setMessages((prevState) => {
						const newState = prevState;
						let changedAny = false;

						Object.entries(data).forEach((status) => {
							let wabaIdOrGetchatId = status[0];

							const statusObj = status[1];

							// Check if any message is displayed with internal id
							// Fix duplicated messages in this way
							const internalIdString =
								ChatMessageModel.generateInternalIdStringStatic(
									statusObj.getchatId
								);

							if (internalIdString in newState) {
								wabaIdOrGetchatId = internalIdString;
							}

							if (wabaIdOrGetchatId in newState) {
								if (statusObj.sentTimestamp) {
									changedAny = true;
									newState[wabaIdOrGetchatId].sentTimestamp =
										statusObj.sentTimestamp;
								}

								if (statusObj.deliveredTimestamp) {
									changedAny = true;
									newState[wabaIdOrGetchatId].deliveredTimestamp =
										statusObj.deliveredTimestamp;
								}

								if (statusObj.readTimestamp) {
									changedAny = true;
									newState[wabaIdOrGetchatId].readTimestamp =
										statusObj.readTimestamp;
								}

								if (statusObj.errors) {
									receivedNewErrors = true;
									changedAny = true;
									newState[wabaIdOrGetchatId].isFailed = true;
									// Merge with existing errors if exist
									if (newState[wabaIdOrGetchatId].errors) {
										newState[wabaIdOrGetchatId].errors.concat(statusObj.errors);
									} else {
										newState[wabaIdOrGetchatId].errors = statusObj.errors;
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

		// Chat assignment
		const onChatAssignment = function (msg, data) {
			// This event always has a single message
			const prepared = getFirstObject(data);
			if (waId === prepared.waId) {
				if (isAtBottom) {
					const prevScrollTop = messagesContainer.current.scrollTop;
					const prevScrollHeight = messagesContainer.current.scrollHeight;
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

				// Reload chat to update assignee information
				retrieveChat();
			}
		};

		const chatAssignmentEventToken = PubSub.subscribe(
			EVENT_TOPIC_CHAT_ASSIGNMENT,
			onChatAssignment
		);

		// Chat tagging
		const onChatAssignmentOrChatTagging = function (msg, data) {
			// This event always has a single message
			const prepared = getFirstObject(data);
			if (waId === prepared.waId) {
				if (isAtBottom) {
					const prevScrollTop = messagesContainer.current.scrollTop;
					const prevScrollHeight = messagesContainer.current.scrollHeight;
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
			}
		};

		const chatTaggingEventToken = PubSub.subscribe(
			EVENT_TOPIC_CHAT_TAGGING,
			onChatAssignmentOrChatTagging
		);

		// Refresh chat/messages when displaying assignment and tagging history is toggled
		const onForceRefreshChat = function (msg, data) {
			if (waId) {
				// Clear existing messages
				flushSync(() => {
					setMessages({});
				});
				setLoaded(false);

				// This method triggers loading messages with proper callback
				retrievePerson(true);
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
		const onUpdatePersonName = function (msg, data) {
			const name = data;
			setPerson((prevState) => {
				if (prevState && prevState instanceof PersonModel) {
					return {
						...prevState,
						name: name,
					};
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

	const prepareFixedDateIndicator = (dateIndicators, el) => {
		const curScrollTop = el.scrollTop;
		let indicatorToShow;

		for (let i = 0; i < dateIndicators.length; i++) {
			const indicator = dateIndicators[i];
			if (
				indicatorToShow === undefined ||
				indicator.offsetTop <= curScrollTop
			) {
				indicatorToShow = indicator;
			} else {
				break;
			}
		}

		if (indicatorToShow) {
			setFixedDateIndicatorText(indicatorToShow.innerHTML);
		}
	};

	const isLastMessageVisible = () => {
		const element = messagesContainer.current;
		return (
			element.scrollHeight - element.scrollTop - element.clientHeight <
			SCROLL_LAST_MESSAGE_VISIBILITY_OFFSET
		);
	};

	const canSeeLastMessage = (element) => {
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
			el.scroll({
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
		prevScrollHeight,
		prevScrollTop,
		offset
	) => {
		const nextScrollHeight = messagesContainer.current.scrollHeight;
		messagesContainer.current.scrollTop =
			nextScrollHeight - prevScrollHeight + prevScrollTop - offset;
	};

	const scrollToChild = (msgId) => {
		setTimeout(function () {
			const child = messagesContainer.current.querySelector(
				'#message_' + msgId
			);
			let _offset = 25;
			if (child) {
				let targetOffsetTop = child.offsetTop - _offset;
				if (targetOffsetTop < SCROLL_OFFSET) targetOffsetTop = SCROLL_OFFSET;
				messagesContainer.current.scroll({
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

	const goToMessageId = (msgId, timestamp) => {
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
		const onGoToMessageId = function (msg, data) {
			const msgId = data.id;
			const timestamp = data.timestamp;

			goToMessageId(msgId, timestamp);
		};

		// Subscribe for scrolling to message event
		const token = PubSub.subscribe(EVENT_TOPIC_GO_TO_MSG_ID, onGoToMessageId);

		return () => {
			// Unsubscribe
			PubSub.unsubscribe(token);
		};
	}, [messages, isAtBottom]);

	const handleChosenFiles = () => {
		if (getObjLength(selectedFiles) > 0) {
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

	const [optionsChatMessage, setOptionsChatMessage] = useState();
	const [menuAnchorEl, setMenuAnchorEl] = useState();

	const displayOptionsMenu = (event, chatMessage) => {
		// We need to use parent because menu view gets hidden
		setMenuAnchorEl(event.currentTarget.parentElement);
		setOptionsChatMessage(chatMessage);
	};

	const retrieveChat = () => {
		apiService.retrieveChatCall(
			waId,
			cancelTokenSourceRef.current.token,
			(response: AxiosResponse) => {
				const preparedChat = new ChatModel(response.data);
				setChat(preparedChat);
			},
			(error: AxiosError) => console.log(error)
		);
	};

	const retrievePerson = (loadMessages) => {
		apiService.retrievePersonCall(
			waId,
			cancelTokenSourceRef.current.token,
			(response) => {
				const preparedPerson = new PersonModel(response.data);
				setPerson(preparedPerson);
				setExpired(preparedPerson.isExpired);

				// Person information is loaded, now load messages
				if (loadMessages !== undefined && loadMessages === true) {
					listMessages(true, function (preparedMessages) {
						const lastPreparedMessage = getLastObject(preparedMessages);
						setLastMessageId(
							lastPreparedMessage?.id ??
								lastPreparedMessage?.generateInternalIdString()
						);

						// Scroll to message if goToMessageId is defined
						const goToMessage = location.state?.goToMessage;
						if (goToMessage !== undefined) {
							goToMessageId(goToMessage.id, goToMessage.timestamp);
						}
					});
				}
			},
			(error) => {
				if (error.response?.status === 404) {
					if (location.person) {
						createPersonAndStartChat(
							location.person.name,
							location.person.initials
						);
					} else {
						// To prevent missing data on refresh
						//closeChat();

						verifyContact();
					}
				} else {
					window.displayError(error);
				}
			}
		);
	};

	let verifyPhoneNumberCancelTokenSourceRef = useRef();

	const verifyContact = () => {
		const onError = () => {
			closeChat();
			window.displayCustomError(
				'There is no WhatsApp account connected to this phone number.'
			);
		};

		let phoneNumber = prepareWaId(waId);
		phoneNumber = addPlus(phoneNumber);

		apiService.verifyContactsCall(
			[phoneNumber],
			verifyPhoneNumberCancelTokenSourceRef.current.token,
			(response) => {
				if (
					response.data.contacts &&
					response.data.contacts.length > 0 &&
					response.data.contacts[0].status === 'valid' &&
					response.data.contacts[0].wa_id !== 'invalid'
				) {
					const returnedWaId = response.data.contacts[0].wa_id;

					if (returnedWaId !== prepareWaId(waId)) {
						// verifyContact returned a different waId, redirecting to chat page with new waId
						navigate(`/main/chat/${returnedWaId}${location.search}`);
					} else {
						createPersonAndStartChat(addPlus(waId), waId?.[0]);
					}
				} else {
					onError();
				}
			},
			(error) => {
				console.error(error);
				onError();
			}
		);
	};

	const createPersonAndStartChat = (name, initials) => {
		const preparedPerson = new PersonModel({});
		preparedPerson.name = name;
		preparedPerson.initials = initials;
		preparedPerson.waId = waId;

		setPerson(preparedPerson);

		setExpired(true);
		setLoaded(true);
		setLoadingMoreMessages(false);
		setAtBottom(true);
	};

	const listMessages = (
		isInitial,
		callback,
		beforeTime,
		offset,
		sinceTime,
		isInitialWithSinceTime,
		replaceAll
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

		apiService.listMessagesCall(
			waId,
			undefined,
			undefined,
			MESSAGES_PER_PAGE,
			offset ?? 0,
			undefined,
			undefined,
			beforeTime,
			sinceTime,
			cancelTokenSourceRef.current.token,
			(response) => {
				const chatMessagesResponse = new ChatMessagesResponse(
					response.data,
					messages,
					true
				);

				if (sinceTime && isInitialWithSinceTime === true) {
					if (chatMessagesResponse.next) {
						/*count > limit*/
						setAtBottom(false);
						listMessages(
							false,
							callback,
							beforeTime,
							chatMessagesResponse.count - MESSAGES_PER_PAGE,
							sinceTime,
							false,
							replaceAll
						);
						return false;
					}
				}

				const preparedMessages = chatMessagesResponse.messages;

				const lastMessage = getLastObject(preparedMessages);

				// Pagination filters for events
				let beforeTimeForEvents = beforeTime;
				let sinceTimeForEvents = sinceTime;

				if (isInitial) {
					beforeTimeForEvents = undefined;
				} else {
					if (!beforeTime) {
						beforeTimeForEvents = lastMessage?.timestamp;
					}
				}

				if (!sinceTime) {
					sinceTimeForEvents = getFirstObject(preparedMessages)?.timestamp;
				}

				// List assignment and tagging history depends on user choice
				if (getDisplayAssignmentAndTaggingHistory()) {
					// List assignment events
					listChatAssignmentEvents(
						preparedMessages,
						isInitial,
						callback,
						replaceAll,
						beforeTime,
						sinceTime,
						beforeTimeForEvents,
						sinceTimeForEvents
					);
				} else {
					finishLoadingMessages(
						preparedMessages,
						isInitial,
						callback,
						replaceAll,
						beforeTime,
						sinceTime
					);
				}
			},
			(error) => {
				setLoadingMoreMessages(false);

				if (isInitial && !axios.isCancel(error)) {
					window.displayCustomError('Failed to load messages!');
				}
			},
			navigate
		);
	};

	// Chain: listMessages -> listChatAssignmentEvents -> listChatTaggingEvents -> finishLoadingMessages
	const finishLoadingMessages = (
		preparedMessages,
		isInitial,
		callback,
		replaceAll,
		beforeTime,
		sinceTime
	) => {
		// Sort prepared messages
		preparedMessages = sortMessagesAsc(preparedMessages);

		if (getObjLength(preparedMessages) > 0) {
			// To persist scroll position, we store current scroll information
			const prevScrollTop = messagesContainer.current.scrollTop;
			const prevScrollHeight = messagesContainer.current.scrollHeight;

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
			});

			if (!sinceTime || replaceAll) {
				persistScrollStateFromBottom(
					prevScrollHeight,
					prevScrollTop,
					SCROLL_OFFSET
				);
			} else if (sinceTime) {
				messagesContainer.current.scrollTop = prevScrollTop;
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
			const lastMessageTimestamp = messageHelper(preparedMessages);
			markAsReceived(lastMessageTimestamp);

			// Auto focus
			PubSub.publish(EVENT_TOPIC_FOCUS_MESSAGE_INPUT);
		}

		// Promise
		if (callback) {
			setTimeout(function () {
				callback(preparedMessages);
			}, 50);
		}
	};

	const listChatAssignmentEvents = (
		preparedMessages,
		isInitial,
		callback,
		replaceAll,
		beforeTime,
		sinceTime,
		beforeTimeForEvents,
		sinceTimeForEvents
	) => {
		apiService.listChatAssignmentEventsCall(
			waId,
			beforeTimeForEvents,
			sinceTimeForEvents,
			cancelTokenSourceRef.current.token,
			(response) => {
				const chatAssignmentEventsResponse = new ChatAssignmentEventsResponse(
					response.data,
					true
				);

				preparedMessages = {
					...preparedMessages,
					...chatAssignmentEventsResponse.messages,
				};

				// List chat tagging events
				listChatTaggingEvents(
					preparedMessages,
					isInitial,
					callback,
					replaceAll,
					beforeTime,
					sinceTime,
					beforeTimeForEvents,
					sinceTimeForEvents
				);
			}
		);
	};

	const listChatTaggingEvents = (
		preparedMessages,
		isInitial,
		callback,
		replaceAll,
		beforeTime,
		sinceTime,
		beforeTimeForEvents,
		sinceTimeForEvents
	) => {
		apiService.listChatTaggingEventsCall(
			waId,
			beforeTimeForEvents,
			sinceTimeForEvents,
			cancelTokenSourceRef.current.token,
			(response) => {
				const chatTaggingEventsResponse = new ChatTaggingEventsResponse(
					response.data,
					true
				);

				preparedMessages = {
					...preparedMessages,
					...chatTaggingEventsResponse.messages,
				};

				// Finish loading
				finishLoadingMessages(
					preparedMessages,
					isInitial,
					callback,
					replaceAll,
					beforeTime,
					sinceTime
				);
			}
		);
	};

	const queueMessage = (
		requestBody,
		successCallback,
		errorCallback,
		completeCallback,
		formData,
		chosenFile
	) => {
		const uniqueID = generateUniqueID();

		// Inject id into requestBody
		requestBody.pendingMessageUniqueId = uniqueID;

		const updatedState = window.pendingMessages;
		updatedState.push({
			id: uniqueID,
			requestBody: requestBody,
			successCallback: successCallback,
			errorCallback: errorCallback,
			completeCallback: completeCallback,
			formData: formData,
			chosenFile: chosenFile,
			isFailed: false,
			willRetry: false,
		});

		props.setPendingMessages([...updatedState]);
	};

	const sendCustomTextMessage = (text) => {
		sendMessage(true, undefined, {
			wa_id: waId,
			type: ChatMessageModel.TYPE_TEXT,
			text: {
				body: text.trim(),
			},
		});
	};

	const bulkSendMessage = (type, payload) => {
		dispatch(setSelectionModeEnabled(true));
		dispatch(setBulkSend(true));

		if (type === ChatMessageModel.TYPE_TEXT) {
			const preparedInput = translateHTMLInputToText(input).trim();
			payload = {
				type: ChatMessageModel.TYPE_TEXT,
				text: {
					body: preparedInput,
				},
			};
		}

		props.setBulkSendPayload(payload);

		// Close chat on mobile
		if (isMobileOnly) {
			closeChat();
		}
	};

	const sanitizeRequestBody = (requestBody) => {
		const sanitizedRequestBody = { ...requestBody };
		delete sanitizedRequestBody['pendingMessageUniqueId'];
		return sanitizedRequestBody;
	};

	const sendMessage = (
		willQueue,
		e,
		customPayload,
		successCallback,
		completeCallback
	) => {
		e?.preventDefault();

		// Check if there is internet connection
		if (!hasInternetConnection()) {
			window.displayCustomError('Check your internet connection.');
			return false;
		}

		let requestBody;

		if (e) {
			const preparedInput = decode(translateHTMLInputToText(input).trim());

			if (preparedInput === '') {
				return false;
			}

			console.log('You typed: ', preparedInput);

			requestBody = {
				wa_id: waId,
				type: ChatMessageModel.TYPE_TEXT,
				text: {
					body: preparedInput,
				},
			};
		} else if (customPayload) {
			// Resend payload is being sent
			requestBody = customPayload;
		}

		// Queue message
		if (willQueue) {
			if (!isLoaded) {
				console.warn('Cancelled sending.');
				return;
			}

			queueMessage(requestBody, successCallback, undefined, completeCallback);
			clearInput();
			return;
		}

		apiService.sendMessageCall(
			sanitizeRequestBody(requestBody),
			(response) => {
				// Message is stored and will be sent later
				if (response.status === 202) {
					displayMessageInChatManually(requestBody, response);
				}

				successCallback?.();
				completeCallback?.();
			},
			(error) => {
				if (error.response) {
					const status = error.response.status;
					// Switch to expired mode if status code is 453
					if (status === 453) {
						setExpired(true);
					} else if (status >= 500) {
						handleFailedMessage(requestBody);
					}

					handleIfUnauthorized(error);
				}

				completeCallback?.();
			}
		);

		// Close emoji picker
		PubSub.publish(EVENT_TOPIC_EMOJI_PICKER_VISIBILITY, false);
	};

	const sendTemplateMessage = (
		willQueue,
		templateMessage,
		customPayload,
		successCallback,
		completeCallback
	) => {
		let requestBody;

		if (customPayload) {
			requestBody = customPayload;
		} else {
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

		apiService.sendMessageCall(
			sanitizeRequestBody(requestBody),
			(response) => {
				// Message is stored and will be sent later
				if (response.status === 202) {
					displayMessageInChatManually(requestBody, response);
				}

				successCallback?.();
				completeCallback?.();

				// Hide dialog by this event
				PubSub.publish(EVENT_TOPIC_SENT_TEMPLATE_MESSAGE, requestBody);
			},
			(error) => {
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

				completeCallback?.();
			}
		);
	};

	const uploadMedia = (chosenFile, payload, formData, completeCallback) => {
		// To display a progress
		props.setUploadingMedia(true);

		apiService.uploadMediaCall(
			formData,
			(response) => {
				// Convert parameters to a ChosenFile object
				sendFile(
					payload?.wa_id,
					response.data.file,
					chosenFile,
					undefined,
					function () {
						completeCallback();
						props.setUploadingMedia(false);
					}
				);
			},
			(error) => {
				if (error.response) {
					if (error.response) {
						handleIfUnauthorized(error);
					}
				}

				// A retry can be considered
				completeCallback();
				props.setUploadingMedia(false);
			}
		);
	};

	const sendFile = (
		receiverWaId,
		fileURL,
		chosenFile,
		customPayload,
		completeCallback
	) => {
		let requestBody;

		if (customPayload) {
			requestBody = customPayload;
		} else {
			requestBody = prepareSendFilePayload(chosenFile, fileURL);
			requestBody = {
				...requestBody,
				wa_id: receiverWaId,
				recipient_type: 'individual',
				to: receiverWaId,
			};
		}

		apiService.sendMessageCall(
			sanitizeRequestBody(requestBody),
			(response) => {
				// Message is stored and will be sent later
				if (response.status === 202) {
					displayMessageInChatManually(requestBody, response);
				}

				// Send next request (or resend callback)
				completeCallback();
			},
			(error) => {
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
					completeCallback();
				}
			}
		);
	};

	const displayMessageInChatManually = (requestBody, response) => {
		flushSync(() => {
			setMessages((prevState) => {
				let text;

				if (
					requestBody.type === ChatMessageModel.TYPE_TEXT ||
					requestBody.text
				) {
					text = requestBody.text.body;
				}

				let getchatId;
				if (response) {
					getchatId = response.data.id;
				}

				const timestamp = generateUnixTimestamp();
				const storedMessage = new ChatMessageModel();
				storedMessage.getchatId = getchatId;
				storedMessage.id = storedMessage.generateInternalIdString();
				storedMessage.waId = waId;
				storedMessage.type = requestBody.type;
				storedMessage.text = text;

				storedMessage.templateName = requestBody.template?.name;
				storedMessage.templateNamespace = requestBody.template?.namespace;
				storedMessage.templateLanguage = requestBody.template?.language?.code;
				storedMessage.templateParameters = requestBody.template?.components;

				storedMessage.imageLink = requestBody.image?.link;
				storedMessage.videoLink = requestBody.video?.link;
				storedMessage.audioLink = requestBody.audio?.link;
				storedMessage.documentLink = requestBody.document?.link;

				storedMessage.caption =
					requestBody.image?.caption ??
					requestBody.video?.caption ??
					requestBody.audio?.caption ??
					requestBody.document?.caption;

				storedMessage.isFromUs = true;
				storedMessage.username = currentUser?.username;
				storedMessage.isFailed = false;
				storedMessage.isStored = true;
				storedMessage.timestamp = timestamp;
				storedMessage.resendPayload = requestBody;

				prevState[storedMessage.id] = storedMessage;
				return { ...prevState };
			});
		});
	};

	const handleFailedMessage = (requestBody) => {
		//displayMessageInChatManually(requestBody, false);

		// Mark message in queue as failed
		props.setPendingMessages([
			...setPendingMessageFailed(requestBody.pendingMessageUniqueId),
		]);
		props.setSendingPendingMessages(false);

		// This will be used to display a warning before refreshing
		props.setHasFailedMessages(true);

		// Last attempt at
		props.setLastSendAttemptAt(new Date());
	};

	const retryMessage = (message: ChatMessageModel) => {
		if (!message.resendPayload) {
			console.warn('Property is undefined: resendPayload', message);
			return;
		}

		message.resendPayload.wa_id = message.waId;

		switch (message.type) {
			case ChatMessageModel.TYPE_TEXT:
				sendMessage(true, undefined, message.resendPayload);
				break;
			case ChatMessageModel.TYPE_TEMPLATE:
				sendTemplateMessage(true, undefined, message.resendPayload);
				break;
			default:
				if (
					[
						ChatMessageModel.TYPE_AUDIO,
						ChatMessageModel.TYPE_VIDEO,
						ChatMessageModel.TYPE_IMAGE,
						ChatMessageModel.TYPE_VOICE,
					].includes(message.type)
				) {
					sendFile(undefined, undefined, undefined, message.resendPayload);
				}
				break;
		}
	};

	const clearInput = () => {
		setInput('');
	};

	const sendHandledChosenFiles = (preparedFiles) => {
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

	const handleDrop = (event) => {
		if (waId) {
			setSelectedFiles(getDroppedFiles(event));
		} else {
			event.preventDefault();
		}
	};

	const markAsReceived = (timestamp) => {
		apiService.markAsReceivedCall(
			waId,
			timestamp,
			cancelTokenSourceRef.current.token,
			(response) => {
				PubSub.publish(EVENT_TOPIC_MARKED_AS_RECEIVED, waId);
				setCurrentNewMessages(0);
			},
			(error) => {
				console.log(error);
			},
			navigate
		);
	};

	const handleIfUnauthorized = (error) => {
		if (error.response.status === 401) {
			clearUserSession('invalidToken', undefined, navigate);
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
			const savedResponseId = commandArray[1] ?? '';
			if (savedResponseId > 0) {
				console.log('Send saved response: ' + savedResponseId);

				const savedResponse = Object.values(savedResponses).filter(
					(curSavedResponse) =>
						curSavedResponse.id?.toString() === savedResponseId
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

	let lastPrintedDate;
	let lastSenderWaId;

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
				setChatAssignmentVisible={props.setChatAssignmentVisible}
				setChatTagsVisible={props.setChatTagsVisible}
				closeChat={closeChat}
				hasFailedMessages={props.hasFailedMessages}
				waId={waId}
			/>

			{/* FOR TESTING QUEUE */}
			{isLocalHost() && props.pendingMessages.length > 0 && (
				<div className="pendingMessagesIndicator">
					<div>{props.isSendingPendingMessages.toString()}</div>
					<div>{props.pendingMessages.length}</div>
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
					// Message date is created here and passed to ChatMessage for a better performance
					const curMsgDate = moment.unix(message[1].timestamp);

					if (index === 0) {
						lastPrintedDate = undefined;
						lastSenderWaId = undefined;
					}

					let willDisplayDate = false;
					if (lastPrintedDate === undefined) {
						willDisplayDate = true;
						lastPrintedDate = moment.unix(message[1].timestamp);
					} else {
						if (!curMsgDate.isSame(lastPrintedDate, 'day')) {
							willDisplayDate = true;
						}

						lastPrintedDate = curMsgDate;
					}

					let willDisplaySender = false;
					const curSenderWaId = message[1].getUniqueSender();
					if (lastSenderWaId === undefined) {
						willDisplaySender = true;
						lastSenderWaId = message[1].getUniqueSender();
					} else {
						if (lastSenderWaId !== curSenderWaId) {
							willDisplaySender = true;
						}

						lastSenderWaId = message[1].getUniqueSender();
					}

					return (
						<ErrorBoundary key={message[0]}>
							<ChatMessage
								data={message[1]}
								templateData={templates[message[1].templateName]}
								displayDate={willDisplayDate}
								displaySender={willDisplaySender}
								date={curMsgDate}
								isTemplatesFailed={props.isTemplatesFailed}
								goToMessageId={goToMessageId}
								retryMessage={retryMessage}
								onOptionsClick={(event, chatMessage) =>
									displayOptionsMenu(event, chatMessage)
								}
								contactProvidersData={props.contactProvidersData}
								setMessageWithStatuses={props.setMessageWithStatuses}
							/>
						</ErrorBoundary>
					);
				})}

				<div className="chat__body__empty" />
			</div>

			{isTemplatesVisible && (
				<TemplateListWithControls
					isTemplatesFailed={props.isTemplatesFailed}
					isLoadingTemplates={props.isLoadingTemplates}
					onSelect={(template: TemplateModel) => {
						setChosenTemplate(template);
						setSendTemplateDialogVisible(true);
					}}
				/>
			)}

			<SendTemplateDialog
				isVisible={isSendTemplateDialogVisible}
				setVisible={setSendTemplateDialogVisible}
				chosenTemplate={chosenTemplate}
				onSend={(templateMessage) => sendTemplateMessage(true, templateMessage)}
				sendCallback={() => setTemplatesVisible(false)}
				onBulkSend={bulkSendMessage}
				isBulkOnly={false}
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
					bulkSendMessage={bulkSendMessage}
					setSelectedFiles={setSelectedFiles}
					isTemplatesVisible={isTemplatesVisible}
					setTemplatesVisible={setTemplatesVisible}
					accept={accept}
					isSavedResponsesVisible={isSavedResponsesVisible}
					setSavedResponsesVisible={setSavedResponsesVisible}
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
					accept={accept}
				/>
			)}
		</div>
	);
};

export default Chat;
