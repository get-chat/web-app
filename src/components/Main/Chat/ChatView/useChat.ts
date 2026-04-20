import React, { useEffect, useRef, useState } from 'react';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import ReactionList from '@src/interfaces/ReactionList';
import {
	generateMessageInternalId,
	getMessageTimestamp,
} from '@src/helpers/MessageHelper';
import {
	CreateMessageRequest,
	Message,
	MessageType,
} from '@src/types/messages';
import {
	generateUniqueID,
	hasInternetConnection,
	translateHTMLInputToText,
} from '@src/helpers/Helpers';
import { createMessage } from '@src/api/messagesApi';
import { AxiosError } from 'axios';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_EMOJI_PICKER_VISIBILITY } from '@src/Constants';
// @ts-ignore
import decode from 'unescape';
import ChosenFileClass from '@src/ChosenFileClass';
import { setPendingMessages } from '@src/store/reducers/pendingMessagesReducer';
import { flushSync } from 'react-dom';
import { getUnixTimestamp } from '@src/helpers/DateHelper';
import { setPendingMessageFailed } from '@src/helpers/PendingMessagesHelper';
import { setState } from '@src/store/reducers/UIReducer';
import {
	getMessageDraft,
	removeMessageDraft,
	storeMessageDraft,
} from '@src/helpers/StorageHelper';

interface Props {
	waId: string | undefined;
	isLoaded: boolean;
	setExpired: (value: boolean) => void;
	handleIfUnauthorized: (error: AxiosError) => void;
	MESSAGES_PER_PAGE: number;
}

const useChat = ({
	waId,
	isLoaded,
	setExpired,
	handleIfUnauthorized,
	MESSAGES_PER_PAGE,
}: Props) => {
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const users = useAppSelector((state) => state.users.value);
	const templates = useAppSelector((state) => state.templates.value);
	const savedResponses = useAppSelector((state) => state.savedResponses.value);

	const [messages, setMessages] = useState<ChatMessageList>({});
	const [reactions, setReactions] = useState<ReactionList>({});

	const [input, setInputState] = useState('');
	const [prevWaId, setPrevWaId] = useState(waId);

	// Ref for debouncing draft saves
	const draftSaveTimeoutRef = useRef<NodeJS.Timeout>();

	// Custom setInput that also saves draft
	const setInput = (value: string) => {
		setInputState(value);

		// Only save draft if waId exists
		if (waId) {
			// Debounce the draft save to avoid excessive storage writes
			if (draftSaveTimeoutRef.current) {
				clearTimeout(draftSaveTimeoutRef.current);
			}
			draftSaveTimeoutRef.current = setTimeout(() => {
				storeMessageDraft(waId, value);
			}, 300);
		}
	};

	// Reset input immediately when waId changes to avoid showing previous chat's draft
	// And save the previous draft synchronously
	if (waId !== prevWaId) {
		// Clear any pending save timeout
		if (draftSaveTimeoutRef.current) {
			clearTimeout(draftSaveTimeoutRef.current);
		}

		// Save the draft for the previous chat
		if (prevWaId) {
			// We use the current 'input' which holds the value for prevWaId
			storeMessageDraft(prevWaId, input);
		}

		setPrevWaId(waId);
		setInputState('');
	}

	// Restore draft when waId changes
	useEffect(() => {
		if (waId) {
			const savedDraft = getMessageDraft(waId);
			if (savedDraft) {
				setInputState(savedDraft);
			}
		}

		return () => {
			// Cleanup timeout on unmount
			if (draftSaveTimeoutRef.current) {
				clearTimeout(draftSaveTimeoutRef.current);
			}
		};
	}, [waId]);

	const [fixedDateIndicatorText, setFixedDateIndicatorText] =
		useState<string>();

	const pendingMessages = useAppSelector(
		(state) => state.pendingMessages.value
	);

	const dispatch = useAppDispatch();

	const sendMessage = async (
		willQueue: boolean,
		e?: Event | React.KeyboardEvent | React.MouseEvent,
		customPayload?: CreateMessageRequest,
		successCallback?: () => void,
		completeCallback?: () => void
	) => {
		e?.preventDefault();

		// Check if there is internet connection
		if (!hasInternetConnection()) {
			window.displayCustomError('Check your internet connection.');
			return false;
		}

		if (!waId) return false;

		let requestBody: CreateMessageRequest = {};

		if (e) {
			const preparedInput = decode(translateHTMLInputToText(input).trim());

			if (preparedInput === '') {
				return false;
			}

			console.log('You typed: ', preparedInput);

			requestBody = {
				wa_id: waId,
				type: MessageType.text,
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
			setInputState('');
			// Clear the draft when message is queued
			if (waId) {
				removeMessageDraft(waId);
			}
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
				// Switch to expired mode if status code is 453
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

		// Close emoji picker
		PubSub.publish(EVENT_TOPIC_EMOJI_PICKER_VISIBILITY, false);
	};

	const handleFailedMessage = (requestBody: CreateMessageRequest) => {
		//displayMessageInChatManually(requestBody, false);

		// Mark message in queue as failed
		dispatch(
			setPendingMessages([
				...setPendingMessageFailed(
					pendingMessages,
					requestBody.pending_message_unique_id ?? ''
				),
			])
		);
		dispatch(setState({ isSendingPendingMessages: false }));

		// This will be used to display a warning before refreshing
		dispatch(setState({ hasFailedMessages: true }));

		// Last attempt at
		dispatch(setState({ lastSendAttemptAt: new Date() }));
	};

	const displayMessageInChatManually = (
		requestBody: CreateMessageRequest,
		messageId: string
	) => {
		flushSync(() => {
			setMessages((prevState) => {
				const message: Message = {
					id: messageId,
					from_us: true,
					received: false,
					customer_wa_id: requestBody.wa_id ?? '',
					tags: [],
					chat_tags: [],
					is_failed: false,
					sender: currentUser,
					waba_payload: {
						id: messageId,
						timestamp: getUnixTimestamp().toString(),
						...requestBody,
						type: requestBody.type ?? MessageType.none,
					},
				};
				prevState[generateMessageInternalId(message.id)] = message;
				return { ...prevState };
			});
		});
	};

	const queueMessage = (
		requestBody: CreateMessageRequest,
		successCallback?: () => void,
		errorCallback?: () => void,
		completeCallback?: () => void,
		formData?: any,
		chosenFile?: ChosenFileClass
	) => {
		const uniqueID = generateUniqueID();

		// Inject id into requestBody
		requestBody.pending_message_unique_id = uniqueID;

		const updatedState = [...pendingMessages];
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

		dispatch(setPendingMessages([...updatedState]));
	};

	const isTimestampsSame = (checkInReverse: boolean = false): boolean => {
		const messagesArray = Object.values(messages);
		if (checkInReverse) messagesArray.reverse();
		let previousTimestamp = -1;
		let isSame = true;
		for (let i = 0; i < MESSAGES_PER_PAGE; i++) {
			const message = messagesArray[i];
			if (!message) {
				isSame = false;
				break;
			}

			if (i === 0) {
				previousTimestamp = getMessageTimestamp(message) ?? -1;
			} else {
				if (getMessageTimestamp(message) !== previousTimestamp) {
					isSame = false;
					break;
				}

				previousTimestamp = getMessageTimestamp(message) ?? -1;
			}
		}

		return isSame;
	};

	function mergeReactionLists(
		prevState: ReactionList,
		preparedReactions: ReactionList
	): ReactionList {
		const mergedReactions: ReactionList = { ...prevState };

		for (const key in preparedReactions) {
			if (preparedReactions.hasOwnProperty(key)) {
				if (mergedReactions[key]) {
					// Merge arrays for the same key
					mergedReactions[key] = [
						...mergedReactions[key],
						...preparedReactions[key],
					];
				} else {
					// Add the new key-value pair if it doesn't exist
					mergedReactions[key] = preparedReactions[key];
				}
			}
		}

		return mergedReactions;
	}

	const prepareFixedDateIndicator = (
		dateIndicators: NodeListOf<Element> | undefined,
		el: HTMLElement | null
	) => {
		if (!dateIndicators || !el) return;

		const curScrollTop = el.scrollTop;
		let indicatorToShow;

		for (let i = 0; i < dateIndicators.length; i++) {
			const indicator = dateIndicators[i] as HTMLElement;
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

	const sanitizeRequestBody = (
		requestBody: CreateMessageRequest
	): CreateMessageRequest => {
		const sanitizedRequestBody = { ...requestBody };
		delete sanitizedRequestBody['pending_message_unique_id'];
		return sanitizedRequestBody;
	};

	return {
		currentUser,
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
	};
};

export default useChat;
