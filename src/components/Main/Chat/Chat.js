import React, {useEffect, useRef, useState} from 'react'
import '../../../styles/Chat.css'
import {CircularProgress, Zoom} from "@material-ui/core";
import ChatMessage from "./ChatMessage/ChatMessage";
import {useHistory, useLocation, useParams} from "react-router-dom";
import {
    ATTACHMENT_TYPE_DOCUMENT,
    ATTACHMENT_TYPE_IMAGE,
    ATTACHMENT_TYPE_VIDEO,
    EVENT_TOPIC_CHAT_ASSIGNMENT,
    EVENT_TOPIC_CHAT_MESSAGE_STATUS_CHANGE,
    EVENT_TOPIC_CHAT_TAGGING, EVENT_TOPIC_CLEAR_TEXT_MESSAGE_INPUT,
    EVENT_TOPIC_DROPPED_FILES,
    EVENT_TOPIC_EMOJI_PICKER_VISIBILITY,
    EVENT_TOPIC_GO_TO_MSG_ID,
    EVENT_TOPIC_MARKED_AS_RECEIVED,
    EVENT_TOPIC_NEW_CHAT_MESSAGES,
    EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR,
    EVENT_TOPIC_SENT_TEMPLATE_MESSAGE,
    EVENT_TOPIC_UPDATE_PERSON_NAME
} from "../../../Constants";
import ChatMessageClass from "../../../ChatMessageClass";
import PersonClass from "../../../PersonClass";
import TemplateMessages from "./TemplateMessages/TemplateMessages";
import ChatFooter from "./ChatFooter/ChatFooter";
import ChatHeader from "./ChatHeader";
import ChatMessageOptionsMenu from "./ChatMessage/ChatMessageOptionsMenu";
import moment from "moment";
import PubSub from "pubsub-js";
import MessageDateIndicator from "./MessageDateIndicator";
import {
    extractTimestampFromMessage,
    generateUnixTimestamp,
    getFirstObject,
    getLastMessageAndExtractTimestamp,
    getLastObject,
    getObjLength,
    hasInternetConnection,
    isScrollable,
    sortMessagesAsc,
    translateHTMLInputToText
} from "../../../helpers/Helpers";
import PreviewSendMedia from "./PreviewSendMedia";
import {getDroppedFiles, handleDragOver, prepareSelectedFiles} from "../../../helpers/FileHelper";
import SavedResponses from "./SavedResponses";
import {generateTemplateMessagePayload} from "../../../helpers/ChatHelper";
import {isMobileOnly} from "react-device-detect";
import {clearUserSession} from "../../../helpers/ApiHelper";
import {
    generateCancelToken,
    listChatAssignmentEventsCall,
    listChatTaggingEventsCall,
    listMessagesCall,
    markAsReceivedCall,
    retrievePersonCall,
    sendMessageCall,
    uploadMediaCall
} from "../../../api/ApiCalls";
import {Prompt} from 'react-router-dom';

const SCROLL_OFFSET = 15;
const SCROLL_LAST_MESSAGE_VISIBILITY_OFFSET = 150;

export default function Chat(props) {

    const messagesContainer = useRef(null);

    const [fixedDateIndicatorText, setFixedDateIndicatorText] = useState();
    const [isLoaded, setLoaded] = useState(false);
    const [isLoadingMoreMessages, setLoadingMoreMessages] = useState(false);
    const [isExpired, setExpired] = useState(false);
    const [isTemplateMessagesVisible, setTemplateMessagesVisible] = useState(false);
    const [isSavedResponsesVisible, setSavedResponsesVisible] = useState(false);
    const [person, setPerson] = useState();
    const [messages, setMessages] = useState({});
    const [input, setInput] = useState('');
    const [isScrollButtonVisible, setScrollButtonVisible] = useState(false);

    const [hasFailedMessages, setHasFailedMessages] = useState(false);

    const [selectedFiles, setSelectedFiles] = useState();
    const [accept, setAccept] = useState('');

    const [isPreviewSendMediaVisible, setPreviewSendMediaVisible] = useState(false);
    const [previewSendMediaData, setPreviewSendMediaData] = useState();

    const [currentNewMessages, setCurrentNewMessages] = useState(0);

    const [isAtBottom, setAtBottom] = useState(false);

    const [lastMessageId, setLastMessageId] = useState();

    const {waId} = useParams();

    const history = useHistory();
    const location = useLocation();

    const cancelTokenSourceRef = useRef();

    const confirmationMessage = "There are unsent messages in the chat. If you continue, they will be deleted. Are you sure you want to continue?";

    useEffect(() => {
        props.retrieveContactData(waId);

        // Generate a token
        cancelTokenSourceRef.current = generateCancelToken();

        if (messagesContainer) {
            messagesContainer.current.addEventListener('DOMNodeInserted', event => {
                if (event.target.parentNode.id === "chat__body") {
                    const {currentTarget: target} = event;
                    target.scroll({top: target.scrollHeight - target.offsetHeight - SCROLL_OFFSET});
                }
            });
        }

        // Handle files dragged and dropped to sidebar chat
        const handleFilesDropped = function (msg, data) {
            setSelectedFiles(data);
        }

        // Listen for file drop events
        const handleFilesDroppedEventToken = PubSub.subscribe(EVENT_TOPIC_DROPPED_FILES, handleFilesDropped);

        // Clear input on event
        const clearInputOnEvent = function (msg, data) {
            clearInput();
        }

        // Listen for clear input events
        const clearInputEventToken = PubSub.subscribe(EVENT_TOPIC_CLEAR_TEXT_MESSAGE_INPUT, clearInputOnEvent);

        return () => {
            // Cancelling ongoing requests
            cancelTokenSourceRef.current.cancel();

            // Unsubscribe
            PubSub.unsubscribe(handleFilesDroppedEventToken);
            PubSub.unsubscribe(clearInputEventToken);
        }
    }, []);

    useEffect(() => {
        setLoaded(false);

        // Clear values for next route
        setPerson(null);
        setMessages([]);
        setTemplateMessagesVisible(false);
        setSavedResponsesVisible(false);
        setAtBottom(false);
        setInput('');
        setHasFailedMessages(false);

        setPreviewSendMediaVisible(false);
        setPreviewSendMediaData(undefined);

        props.previewMedia(null);

        // Close emoji picker
        PubSub.publish(EVENT_TOPIC_EMOJI_PICKER_VISIBILITY, false);

        if (!waId) {
            console.log('waId is empty.');
            return false;
        }

        // Load contact and messages
        retrievePerson(true);

        return () => {
            // Cancelling ongoing requests
            cancelTokenSourceRef.current.cancel();

            // Generate a new token, because component is not destroyed
            cancelTokenSourceRef.current = generateCancelToken();
        }
    }, [waId]);

    useEffect(() => {
        // Window close event
        window.addEventListener('beforeunload', alertUser);
        return () => {
            window.removeEventListener('beforeunload', alertUser);
        }
    }, [hasFailedMessages]);

    const alertUser = e => {
        if (hasFailedMessages) {
            if (!window.confirm(confirmationMessage)) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
    }

    useEffect(() => {
        props.setChosenContact(person);
    }, [person]);

    const getNewMessagesCount = () => {
        return props.newMessages[waId]?.newMessages ?? 0;
    }

    useEffect(() => {
        const newMessagesCount = getNewMessagesCount();
        if (newMessagesCount > currentNewMessages) {
            setCurrentNewMessages(newMessagesCount);
        }
    }, [waId, props.newMessages]);

    useEffect(() => {
        const messagesContainerCopy = messagesContainer.current;
        const dateIndicators = messagesContainerCopy.querySelectorAll('.chat__message__outer > .chat__message__dateContainer > .chat__message__dateContainer__indicator');

        // To optimize scroll event
        let debounceTimer;

        // Consider replacing this with IntersectionObserver
        // Browser support should be considered: https://caniuse.com/intersectionobserver
        function handleScroll(e) {
            if (debounceTimer) {
                window.clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(function () {
                const threshold = 0;
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

                    if (el.scrollTop <= threshold) {
                        //console.log("Scrolled to top");
                        if (isLoaded && !isLoadingMoreMessages) {
                            setLoadingMoreMessages(true);
                            listMessages(false, undefined, getFirstObject(messages)?.timestamp);
                        }
                    } else {
                        // TODO: Make sure user scrolls
                        if (el.scrollHeight - el.scrollTop - el.clientHeight < 1) {
                            //console.log('Scrolled to bottom');
                            if (isLoaded && !isLoadingMoreMessages && !isAtBottom) {
                                setLoadingMoreMessages(true);
                                listMessages(false, undefined, undefined, undefined, getLastObject(messages)?.timestamp, true, false);
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
            messagesContainerCopy.addEventListener("scroll", handleScroll);

            // Display fixed date indicator
            prepareFixedDateIndicator(dateIndicators, messagesContainerCopy);
        }

        return () => {
            clearTimeout(debounceTimer);
            messagesContainerCopy.removeEventListener("scroll", handleScroll);
        }
    }, [messages, isLoaded, isLoadingMoreMessages, isAtBottom, currentNewMessages]);

    useEffect(() => {
        // New messages
        const onNewMessages = function (msg, data) {
            if (data && isLoaded) {
                let hasAnyIncomingMsg = false;

                const preparedMessages = {};
                Object.entries(data).forEach((message) => {
                    const msgId = message[0];
                    const chatMessage = message[1];

                    if (waId === chatMessage.waId) {
                        preparedMessages[msgId] = chatMessage;

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

                        setMessages(prevState => {
                            return {...prevState, ...preparedMessages};
                        });

                        if (!isCurrentlyLastMessageVisible) {
                            persistScrollStateFromBottom(prevScrollHeight, prevScrollTop, 0);
                            displayScrollButton();
                        }

                        if (hasAnyIncomingMsg) {
                            const lastMessageTimestamp = extractTimestampFromMessage(lastMessage);

                            // Mark new message as received if visible
                            if (canSeeLastMessage(messagesContainer.current)) {
                                markAsReceived(lastMessageTimestamp);
                            } else {
                                setCurrentNewMessages(prevState => prevState+1);
                            }

                            // Update contact
                            setPerson(prevState => {
                                const nextState = prevState;
                                nextState.lastMessageTimestamp = lastMessageTimestamp;
                                nextState.isExpired = false;

                                return nextState;
                            });

                            // Chat is not expired anymore
                            setExpired(false);
                        }
                    } else {
                        setCurrentNewMessages(prevState => prevState+1);
                    }

                    // Update last message id
                    setLastMessageId(lastMessage.id);
                }
            }
        }

        const newChatMessagesEventToken = PubSub.subscribe(EVENT_TOPIC_NEW_CHAT_MESSAGES, onNewMessages);

        // Status changes
        const onMessageStatusChange = function (msg, data) {
            if (data && isLoaded) {

                // TODO: Check if message belongs to active conversation to avoid doing this unnecessarily
                setMessages(prevState => {
                    const newState = prevState;
                    let changedAny = false;

                    Object.entries(data).forEach((status) => {
                        const statusMsgId = status[0];
                        const statusObj = status[1];

                        if (newState[statusMsgId]) {
                            if (statusObj.sentTimestamp) {
                                changedAny = true;
                                newState[statusMsgId].sentTimestamp = statusObj.sentTimestamp;
                            }

                            if (statusObj.deliveredTimestamp) {
                                changedAny = true;
                                newState[statusMsgId].deliveredTimestamp = statusObj.deliveredTimestamp;
                            }

                            if (statusObj.readTimestamp) {
                                changedAny = true;
                                newState[statusMsgId].readTimestamp = statusObj.readTimestamp;
                            }
                        }
                    });

                    if (changedAny) {
                        return {...newState};
                    } else {
                        return prevState;
                    }
                });
            }
        }

        const chatMessageStatusChangeEventToken = PubSub.subscribe(EVENT_TOPIC_CHAT_MESSAGE_STATUS_CHANGE, onMessageStatusChange);

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
                    setMessages(prevState => {
                        return {...prevState, ...data};
                    });

                    if (!isCurrentlyLastMessageVisible) {
                        persistScrollStateFromBottom(prevScrollHeight, prevScrollTop, 0);
                        displayScrollButton();
                    }
                } else {
                    displayScrollButton();
                }
            }
        }

        const chatAssignmentEventToken = PubSub.subscribe(EVENT_TOPIC_CHAT_ASSIGNMENT, onChatAssignment);

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
                    setMessages(prevState => {
                        return {...prevState, ...data};
                    });

                    if (!isCurrentlyLastMessageVisible) {
                        persistScrollStateFromBottom(prevScrollHeight, prevScrollTop, 0);
                        displayScrollButton();
                    }
                } else {
                    displayScrollButton();
                }
            }
        }

        const chatTaggingEventToken = PubSub.subscribe(EVENT_TOPIC_CHAT_TAGGING, onChatAssignmentOrChatTagging);

        return () => {
            PubSub.unsubscribe(newChatMessagesEventToken);
            PubSub.unsubscribe(chatMessageStatusChangeEventToken);
            PubSub.unsubscribe(chatAssignmentEventToken);
            PubSub.unsubscribe(chatTaggingEventToken);
        }
    }, [waId, messages, isLoaded, /*isLoadingMoreMessages,*/ isExpired, isAtBottom, currentNewMessages]);

    useEffect(() => {
        const hasNewerToLoad = lastMessageId === undefined || !messages.hasOwnProperty(lastMessageId); //(previous != null && typeof previous !== typeof undefined);
        console.log("Has newer to load:", hasNewerToLoad);
        setAtBottom(!hasNewerToLoad);

    }, [messages, lastMessageId]);

    useEffect(() => {
        const onUpdatePersonName = function (msg, data) {
            const name = data;
            setPerson(prevState => {
                prevState?.setName(name);
                // Assign object to a new instance to trigger change
                return Object.assign(PersonClass.newInstance(), prevState);
            });
        }

        const updatePersonNameTokenEventToken = PubSub.subscribe(EVENT_TOPIC_UPDATE_PERSON_NAME, onUpdatePersonName);

        return () => {
            PubSub.unsubscribe(updatePersonNameTokenEventToken);
        }
    }, [person]);

    /*useEffect(() => {
        // Scrolling to bottom on initial templates load
        if (!isLoadingTemplates) {
            const target = messagesContainer.current;
            target.scroll({top: target.scrollHeight - SCROLL_OFFSET});
        }
    }, [isLoadingTemplates]);*/

    const prepareFixedDateIndicator = (dateIndicators, el) => {
        const curScrollTop = el.scrollTop;
        let indicatorToShow;

        for (let i = 0; i < dateIndicators.length; i++) {
            const indicator = dateIndicators[i];
            if (indicatorToShow === undefined || indicator.offsetTop <= curScrollTop) {
                indicatorToShow = indicator;
            } else {
                break;
            }
        }

        if (indicatorToShow) {
            setFixedDateIndicatorText(indicatorToShow.innerHTML);
        }
    }

    const isLastMessageVisible = () => {
        const el = messagesContainer.current;
        return el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_LAST_MESSAGE_VISIBILITY_OFFSET;
    }

    const displayScrollButton = () => {
        setScrollButtonVisible(true);
    }

    const canSeeLastMessage = (element) => {
        return !(element.scrollHeight - element.scrollTop - element.clientHeight > SCROLL_LAST_MESSAGE_VISIBILITY_OFFSET);
    }

    const handleScrollButtonClick = () => {
        if (isAtBottom) {
            const el = messagesContainer.current;
            el.scroll({top: el.scrollHeight - el.offsetHeight - SCROLL_OFFSET, behavior: "smooth"});
        } else {
            listMessages(false, undefined, undefined, undefined, undefined, false, true);
        }

        //setScrollButtonVisible(false);
    }

    const persistScrollStateFromBottom = (prevScrollHeight, prevScrollTop, offset) => {
        const nextScrollHeight = messagesContainer.current.scrollHeight;
        messagesContainer.current.scrollTop = (nextScrollHeight - prevScrollHeight) + prevScrollTop - offset;
    }

    const scrollToChild = (msgId) => {
        setTimeout(function () {
            const child = messagesContainer.current.querySelector('#message_' + msgId);
            let _offset = 25;
            if (child) {
                let targetOffsetTop = child.offsetTop - _offset;
                if (targetOffsetTop < SCROLL_OFFSET) targetOffsetTop = SCROLL_OFFSET;
                messagesContainer.current.scroll({top: targetOffsetTop, behavior: "smooth"});

                child.classList.add('blink');

                setTimeout(function () {
                    if (child) {
                        child.classList.remove('blink');
                    }
                }, 1000);
            }
        }, 100);
    }

    const goToMessageId = (msgId, timestamp) => {
        if (messagesContainer.current) {
            if (msgId) {
                if (messages[msgId]) {
                    console.log("This message is already loaded.");
                    scrollToChild(msgId);
                } else {
                    console.log("This message will be loaded.");

                    // TODO: Cancel other messages requests first

                    // Load messages since clicked results
                    setLoadingMoreMessages(true);
                    const callback = () => {
                        scrollToChild(msgId);
                    };
                    listMessages(false, callback, undefined, undefined, timestamp, true, true);
                }
            }
        }
    }

    useEffect(() => {
        const onGoToMessageId = function (msg, data) {
            const msgId = data.id;
            const timestamp = data.timestamp;

            goToMessageId(msgId, timestamp);
        }

        // Subscribe for scrolling to message event
        const token = PubSub.subscribe(EVENT_TOPIC_GO_TO_MSG_ID, onGoToMessageId);

        return () => {
            // Unsubscribe
            PubSub.unsubscribe(token);
        }
    }, [messages, isAtBottom]);

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
    }

    const retrievePerson = (loadMessages) => {
        retrievePersonCall(waId, cancelTokenSourceRef.current.token, (response) => {
            const preparedPerson = new PersonClass(response.data);
            setPerson(preparedPerson);
            setExpired(preparedPerson.isExpired);

            // Person information is loaded, now load messages
            if (loadMessages !== undefined && loadMessages === true) {
                listMessages(true, function (preparedMessages) {
                    setLastMessageId(getLastObject(preparedMessages)?.id);

                    // Scroll to message if goToMessageId is defined
                    const goToMessage = location.goToMessage;
                    if (goToMessage !== undefined) {
                        goToMessageId(goToMessage.id, goToMessage.timestamp);
                    }
                });
            }
        }, (error) => {
            if (error.response?.status === 404) {
                if (location.person) {
                    const preparedPerson = new PersonClass({});
                    preparedPerson.name = location.person.name;
                    preparedPerson.initials = location.person.initials;
                    preparedPerson.waId = waId;

                    setPerson(preparedPerson);

                    setExpired(true);
                    setLoaded(true);
                    setLoadingMoreMessages(false);
                    setAtBottom(true);
                } else {
                    // To prevent missing data on refresh
                    closeChat();
                }
            } else {
                window.displayError(error);
            }
        });
    }

    const listMessages = (isInitial, callback, beforeTime, offset, sinceTime, isInitialWithSinceTime, replaceAll) => {
        const limit = 30;

        listMessagesCall(waId, undefined, limit, offset ?? 0, beforeTime, sinceTime, cancelTokenSourceRef.current.token,
            (response) => {
                const count = response.data.count;
                //const previous = response.data.previous;
                const next = response.data.next;

                if (sinceTime && isInitialWithSinceTime === true) {
                    if (next) { /*count > limit*/
                        setAtBottom(false);
                        listMessages(false, callback, beforeTime, count - limit, sinceTime, false, replaceAll);
                        return false;
                    }
                }

                const preparedMessages = {};
                response.data.results.reverse().forEach((message) => {
                    const prepared = new ChatMessageClass(message);
                    preparedMessages[prepared.id] = prepared;
                });

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

                // List assignment events
                listChatAssignmentEvents(preparedMessages, isInitial, callback, replaceAll, beforeTime, sinceTime, beforeTimeForEvents, sinceTimeForEvents);
            }, (error) => {
                setLoadingMoreMessages(false);
            }, history);
    }

    // Chain: listMessages -> listChatAssignmentEvents -> listChatTaggingEvents -> finishLoadingMessages
    const finishLoadingMessages = (preparedMessages, isInitial, callback, replaceAll, beforeTime, sinceTime) => {

        // Sort prepared messages
        preparedMessages = sortMessagesAsc(preparedMessages);

        if (getObjLength(preparedMessages) > 0) {
            // To persist scroll position, we store current scroll information
            const prevScrollTop = messagesContainer.current.scrollTop;
            const prevScrollHeight = messagesContainer.current.scrollHeight;

            setMessages((prevState => {
                let nextState;
                if (replaceAll) {
                    nextState = preparedMessages;
                } else {
                    if (sinceTime) {
                        nextState = {...prevState, ...preparedMessages}
                    } else {
                        nextState = {...preparedMessages, ...prevState}
                    }
                }

                // Sort final object
                return sortMessagesAsc(nextState);
            }));

            if (!sinceTime || replaceAll) {
                persistScrollStateFromBottom(prevScrollHeight, prevScrollTop, SCROLL_OFFSET);
            } else if (sinceTime) {
                messagesContainer.current.scrollTop = prevScrollTop;
            }
        }

        setLoaded(true);
        setLoadingMoreMessages(false);

        // TODO: Check unread messages first and then decide to do it or not
        if (isInitial) {
            // beforeTime is not passed only for initial request
            // Mark messages as received
            const lastMessageTimestamp = getLastMessageAndExtractTimestamp(preparedMessages);
            markAsReceived(lastMessageTimestamp);
        }

        // Promise
        if (callback) {
            setTimeout(function () {
                callback(preparedMessages);
            }, 50);
        }
    }

    const listChatAssignmentEvents = (preparedMessages, isInitial, callback, replaceAll, beforeTime, sinceTime, beforeTimeForEvents, sinceTimeForEvents) => {
        listChatAssignmentEventsCall(waId, beforeTimeForEvents, sinceTimeForEvents, cancelTokenSourceRef.current.token,
            (response) => {
                response.data.results.reverse().forEach((assignmentEvent) => {
                    const prepared = ChatMessageClass.fromAssignmentEvent(assignmentEvent);
                    preparedMessages[prepared.id] = prepared;
                });

                // List chat tagging events
                listChatTaggingEvents(preparedMessages, isInitial, callback, replaceAll, beforeTime, sinceTime, beforeTimeForEvents, sinceTimeForEvents);
            });
    }

    const listChatTaggingEvents = (preparedMessages, isInitial, callback, replaceAll, beforeTime, sinceTime, beforeTimeForEvents, sinceTimeForEvents) => {
        listChatTaggingEventsCall(waId, beforeTimeForEvents, sinceTimeForEvents, cancelTokenSourceRef.current.token,
            (response) => {
                response.data.results.reverse().forEach((taggingEvent) => {
                    const prepared = ChatMessageClass.fromTaggingEvent(taggingEvent);
                    preparedMessages[prepared.id] = prepared;
                });

                // Finish loading
                finishLoadingMessages(preparedMessages, isInitial, callback, replaceAll, beforeTime, sinceTime);
            });
    }

    const resendMessage = (message) => {
        const successCallback = () => {
            // Delete message if resent successfully
            setMessages(prevState => {
                delete prevState[message.id];

                // Check if there is another failed message
                let hasAnotherFailedMessage = false;

                for (let i = 0; i < getObjLength(messages); i++) {
                    const curMessage = messages[i];
                    if (curMessage.isFailed && !curMessage.isStored) {
                        hasAnotherFailedMessage = true;
                        break;
                    }
                }

                setHasFailedMessages(hasAnotherFailedMessage);

                return {...prevState};
            });
        }

        const resendPayload = message.resendPayload;

        if (resendPayload.type === ChatMessageClass.TYPE_TEXT || resendPayload.text) {
            sendMessage(undefined, resendPayload, successCallback);
        } else if (resendPayload.type === ChatMessageClass.TYPE_TEMPLATE) {
            sendTemplateMessage(undefined, resendPayload, successCallback);
        } else {
            // File
            sendFile(undefined, undefined, resendPayload, successCallback);
        }
    }

    const sendCustomTextMessage = (text) => {
        sendMessage(undefined, {
            wa_id: waId,
            text: {
                body: text.trim()
            }
        });
    }

    const bulkSendMessage = (type, payload) => {
        props.setSelectionModeEnabled(true);

        if (type === ChatMessageClass.TYPE_TEXT) {
            const preparedInput = translateHTMLInputToText(input).trim();
            payload = {
                type: "text",
                text: {
                    body: preparedInput
                }
            };
        }

        props.setBulkSendPayload(payload);

        // Close chat on mobile
        if (isMobileOnly) {
            closeChat();
        }
    }

    const sendMessage = (e, customPayload, callback) => {
        e?.preventDefault();

        // Check if has internet connection
        if (!hasInternetConnection()) {
            window.displayCustomError('Check your internet connection.');
            return false;
        }

        let requestBody;

        if (e) {
            const preparedInput = translateHTMLInputToText(input).trim();

            if (preparedInput === '') {
                return false;
            }

            console.log('You typed: ', preparedInput);

            requestBody = {
                wa_id: waId,
                text: {
                    body: preparedInput
                }
            };
        } else if (customPayload) {
            // Resend payload is being sent
            requestBody = customPayload;
        }

        if (isLoaded) {
            sendMessageCall(requestBody,
                (response) => {
                    // TODO: Display message immediately
                    /*const messageId = response.data?.waba_response?.messages?.[0]?.id;
                    setMessages(prevState => {
                        const sentMessage = new ChatMessageClass();
                        prevState[messageId] = sentMessage;
                        return {...prevState};
                    });*/

                    if (callback) {
                        callback();
                    }
                }, (error) => {
                    if (error.response) {
                        const status = error.response.status;
                        // Switch to expired mode if status code is 453
                        if (status === 453) {
                            setExpired(true);
                        } else if (status === 500 || status === 502) {
                            const isStored = status === 502;
                            displayFailedMessage(requestBody, isStored, true);

                            // This will be used to display a warning before refreshing
                            if (!isStored) {
                                setHasFailedMessages(true);
                            }
                        }

                        handleIfUnauthorized();
                    }
                });

            clearInput();

            // Close emoji picker
            PubSub.publish(EVENT_TOPIC_EMOJI_PICKER_VISIBILITY, false);
        }
    }

    const sendTemplateMessage = (templateMessage, customPayload, callback) => {
        let requestBody;

        if (customPayload) {
            requestBody = customPayload;
        } else {
            requestBody = generateTemplateMessagePayload(templateMessage);
            requestBody.wa_id = waId;
        }

        if (isLoaded) {
            sendMessageCall(requestBody,
                (response) => {
                    // Hide dialog by this event
                    PubSub.publish(EVENT_TOPIC_SENT_TEMPLATE_MESSAGE, true);

                    if (callback) {
                        callback();
                    }
                }, (error) => {
                    if (error.response) {
                        const errors = error.response.data?.waba_response?.errors;
                        PubSub.publish(EVENT_TOPIC_SEND_TEMPLATE_MESSAGE_ERROR, errors);

                        const status = error.response.status;

                        if (status === 453) {
                            setExpired(true);
                        } else if (status === 500 || status === 502) {
                            const isStored = status === 502;
                            displayFailedMessage(requestBody, isStored);
                        }

                        handleIfUnauthorized(error);
                    }
                });
        }
    }

    const displayFailedMessage = (requestBody, isStored, willClearInput) => {
        setMessages(prevState => {
            let text;

            if (requestBody.type === ChatMessageClass.TYPE_TEXT || requestBody.text) {
                text = requestBody.text.body;
            } else if (requestBody.type === ChatMessageClass.TYPE_TEMPLATE) {
                text = requestBody.template.name;
            } else {
                // File
                text = requestBody.link;
            }

            const timestamp = generateUnixTimestamp();
            const messageId = 'failed_' + timestamp;
            const failedMessage = new ChatMessageClass();
            failedMessage.id = messageId;
            failedMessage.text = text;
            failedMessage.isFromUs = true;
            failedMessage.isFailed = true;
            failedMessage.isStored = isStored;
            failedMessage.timestamp = timestamp;
            failedMessage.resendPayload = requestBody;

            prevState[messageId] = failedMessage;
            return {...prevState};
        });

        if (willClearInput === true) {
            clearInput();
        }
    }

    const clearInput = () => {
        setInput('')
    }

    const sendFile = (fileURL, chosenFile, customPayload, callback) => {
        let requestBody;

        if (customPayload) {
            requestBody = customPayload;
        } else {
            const caption = chosenFile.caption;
            const type = chosenFile.attachmentType;
            const file = chosenFile.file;
            const filename = file.name;
            const mimeType = file.type;

            requestBody = {
                wa_id: waId,
                recipient_type: 'individual',
                to: waId,
                type: type
            };

            requestBody[type] = {
                link: fileURL,
                mime_type: mimeType,
            }

            // caption param is accepted for only images and videos
            if (type === ATTACHMENT_TYPE_IMAGE || type === ATTACHMENT_TYPE_VIDEO) {
                requestBody[type]['caption'] = caption;
            }

            // filename param is accepted for documents
            if (type === ATTACHMENT_TYPE_DOCUMENT) {
                requestBody[type]['filename'] = filename;
            }
        }

        if (isLoaded) {
            sendMessageCall(requestBody,
                (response) => {
                    // Send next request (or resend callback)
                    callback();
                }, (error) => {
                    if (error.response) {
                        const status = error.response.status;

                        if (status === 453) {
                            setExpired(true);
                        } else if (status === 500 || status === 502) {
                            const isStored = status === 502;
                            displayFailedMessage(requestBody, isStored);
                        }

                        handleIfUnauthorized(error);
                    }

                    // Send next when it fails, a retry can be considered
                    // If custom payload is empty, it means it is resending, so it is just a success callback
                    if (!customPayload) {
                        callback();
                    }
                });
        }
    }

    const handleChosenFiles = () => {
        if (getObjLength(selectedFiles) > 0) {
            const preparedFiles = prepareSelectedFiles(selectedFiles);

            setPreviewSendMediaData(preparedFiles);
            setPreviewSendMediaVisible(true);
        }
    }

    const sendHandledChosenFiles = (preparedFiles) => {
        if (isLoaded && preparedFiles) {
            const requests = [];

            // Sending all files in a loop
            Object.entries(preparedFiles).forEach((curFile) => {
                const curChosenFile = curFile[1];
                const file = curChosenFile.file;

                const formData = new FormData();
                formData.append("file_encoded", file);

                requests.push({
                    formData: formData,
                    chosenFile: curChosenFile
                });
            });

            let requestIndex = 0;

            const sendRequest = (request) => {
                const sendNextRequest = () => {
                    requestIndex++;
                    const nextRequest = requests[requestIndex];
                    if (nextRequest) {
                        sendRequest(nextRequest);
                    }
                }

                uploadMediaCall(request.formData,
                    (response) => {
                        // Convert parameters to a ChosenFile object
                        sendFile(response.data.file, request.chosenFile, undefined, function () {
                            sendNextRequest();
                        });
                    }, (error) => {
                        if (error.response) {
                            if (error.response) {
                                handleIfUnauthorized(error);
                            }
                        }

                        // Send next when it fails, a retry can be considered
                        sendNextRequest();
                    });
            }

            sendRequest(requests[requestIndex]);
        }
    }

    const handleDrop = (event) => {
        if (waId) {
            setSelectedFiles(getDroppedFiles(event));
        } else {
            event.preventDefault();
        }
    }

    const markAsReceived = (timestamp) => {
        markAsReceivedCall(waId, timestamp, cancelTokenSourceRef.current.token,
            (response) => {
                PubSub.publish(EVENT_TOPIC_MARKED_AS_RECEIVED, waId);
                setCurrentNewMessages(0);
            });
    }

    const handleIfUnauthorized = (error) => {
        if (error.response.status === 401) {
            clearUserSession("invalidToken", undefined, history);
        }
    }

    const closeChat = () => {
        history.push("/main");
    }

    let lastPrintedDate;
    let lastSenderWaId;

    return (
        <div
            className={"chat" + (waId ? " chatOpen" : "") + (props.isChatOnly ? " chatFullWidth" : "")}
            onDrop={(event) => handleDrop(event)}
            onDragOver={(event) => handleDragOver(event)}>

            <Prompt when={hasFailedMessages}
                    message={confirmationMessage} />

            <ChatHeader
                person={person}
                contactProvidersData={props.contactProvidersData}
                retrieveContactData={props.retrieveContactData}
                isChatOnly={props.isChatOnly}
                setChatAssignmentVisible={props.setChatAssignmentVisible}
                setChatTagsVisible={props.setChatTagsVisible}
                closeChat={closeChat} />

            <Zoom in={(isLoaded && !isLoadingMoreMessages && (fixedDateIndicatorText !== undefined && fixedDateIndicatorText.trim().length > 0))}>
                <div className="chat__body__dateIndicator">
                    <MessageDateIndicator text={fixedDateIndicatorText} />
                </div>
            </Zoom>

            <Zoom in={(waId && !isLoaded) || isLoadingMoreMessages}>
                <div className="chat__body__loadingMore">
                    <div className="chat__body__loadingMore__wrapper">
                        <CircularProgress size={28} />
                    </div>
                </div>
            </Zoom>

            <div id="chat__body" className="chat__body" ref={messagesContainer} onDrop={(event) => event.preventDefault()}>
                <div className="chat__empty"/>

                { Object.entries(messages).map((message, index) => {

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
                        <ChatMessage
                            key={message[0]}
                            messageData={message[1]}
                            displayDate={willDisplayDate}
                            displaySender={willDisplaySender}
                            date={curMsgDate}
                            onPreview={(chatMessage) => props.previewMedia(chatMessage)}
                            templates={props.templates}
                            goToMessageId={goToMessageId}
                            onOptionsClick={(event, chatMessage) => displayOptionsMenu(event, chatMessage)}
                            contactProvidersData={props.contactProvidersData}
                            retrieveContactData={props.retrieveContactData}
                            resendMessage={(message) => resendMessage(message)} />
                    )
                }) }

                <div className="chat__body__empty" />

            </div>

            <ChatFooter
                waId={waId}
                currentNewMessages={currentNewMessages}
                isExpired={isExpired}
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}
                bulkSendMessage={bulkSendMessage}
                setSelectedFiles={setSelectedFiles}
                isTemplateMessagesVisible={isTemplateMessagesVisible}
                setTemplateMessagesVisible={setTemplateMessagesVisible}
                isSavedResponsesVisible={isSavedResponsesVisible}
                setSavedResponsesVisible={setSavedResponsesVisible}
                sendHandledChosenFiles={sendHandledChosenFiles}
                accept={accept}
                setAccept={setAccept}
                isScrollButtonVisible={isScrollButtonVisible}
                handleScrollButtonClick={handleScrollButtonClick}
                closeChat={closeChat} />

            {isTemplateMessagesVisible &&
            <TemplateMessages
                waId={waId}
                templatesData={props.templates}
                onSend={(templateMessage) => sendTemplateMessage(templateMessage)}
                onBulkSend={bulkSendMessage}
                isLoadingTemplates={props.isLoadingTemplates} />
            }

            {isSavedResponsesVisible &&
            <SavedResponses
                savedResponses={props.savedResponses}
                deleteSavedResponse={props.deleteSavedResponse}
                sendCustomTextMessage={sendCustomTextMessage} />
            }

            {!waId &&
            <div className="chat__default">
                <h2>Hey</h2>
                <p>Choose a contact to start a conversation</p>
            </div>
            }

            <ChatMessageOptionsMenu
                menuAnchorEl={menuAnchorEl}
                setMenuAnchorEl={setMenuAnchorEl}
                optionsChatMessage={optionsChatMessage}
                createSavedResponse={props.createSavedResponse} />

            {isPreviewSendMediaVisible &&
            <PreviewSendMedia
                data={previewSendMediaData}
                setData={setPreviewSendMediaData}
                setPreviewSendMediaVisible={setPreviewSendMediaVisible}
                sendHandledChosenFiles={sendHandledChosenFiles}
                accept={accept} />
            }

        </div>
    )
}