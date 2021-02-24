import React, {useEffect, useRef, useState} from 'react'
import '../styles/Chat.css'
import {CircularProgress, Zoom} from "@material-ui/core";
import ChatMessage from "./ChatMessage";
import {useParams} from "react-router-dom";
import axios from "axios";
import {
    ATTACHMENT_TYPE_DOCUMENT,
    ATTACHMENT_TYPE_IMAGE,
    ATTACHMENT_TYPE_VIDEO,
    BASE_URL,
    EVENT_TOPIC_DROPPED_FILES,
    EVENT_TOPIC_EMOJI_PICKER_VISIBILITY,
    EVENT_TOPIC_GO_TO_MSG_ID
} from "../Constants";
import ChatMessageClass from "../ChatMessageClass";
import ContactClass from "../ContactClass";
import ChatFooterExpired from "./ChatFooterExpired";
import TemplateMessages from "./TemplateMessages";
import ChatFooter from "./ChatFooter";
import ChatHeader from "./ChatHeader";
import {getPastHoursByTimestamp} from "../DateHelpers";
import ChatMessageOptionsMenu from "./ChatMessageOptionsMenu";
import moment from "moment";
import PubSub from "pubsub-js";
import MessageDateIndicator from "./MessageDateIndicator";
import {
    getConfig,
    getFirstObject,
    getLastMessageAndExtractTimestamp,
    getLastObject,
    getObjLength,
    translateHTMLInputToText
} from "../Helpers";
import PreviewSendMedia from "./PreviewSendMedia";
import {getDroppedFiles, handleDragOver, prepareSelectedFiles} from "../FileHelpers";

const SCROLL_BOTTOM_OFFSET = 15;

export default function Chat(props) {

    const messagesContainer = useRef(null);
    const [fixedDateIndicatorText, setFixedDateIndicatorText] = useState();
    const [isLoaded, setLoaded] = useState(false);
    const [isLoadingMoreMessages, setLoadingMoreMessages] = useState(false);
    const [isExpired, setExpired] = useState(false);
    const [isTemplateMessagesVisible, setTemplateMessagesVisible] = useState(false);
    const [contact, setContact] = useState();
    const [messages, setMessages] = useState({});
    const [input, setInput] = useState('');

    const [selectedFiles, setSelectedFiles] = useState();
    const [accept, setAccept] = useState("");

    const [isPreviewSendMediaVisible, setPreviewSendMediaVisible] = useState(false);
    const [previewSendMediaData, setPreviewSendMediaData] = useState();

    const [isAtBottom, setAtBottom] = useState(false);

    const {waId} = useParams();

    let cancelToken;
    let source;

    const generateCancelToken = () => {
        cancelToken = axios.CancelToken;
        source = cancelToken.source();
    }

    // Generating cancel token
    generateCancelToken();

    useEffect(() => {
        if (messagesContainer) {
            messagesContainer.current.addEventListener('DOMNodeInserted', event => {
                if (event.target.parentNode.id === "chat__body") {
                    const {currentTarget: target} = event;
                    target.scroll({top: target.scrollHeight - SCROLL_BOTTOM_OFFSET});
                }
            });
        }

        // Handle files dragged and dropped to sidebar chat
        const handleFilesDropped = function (msg, data) {
            setSelectedFiles(data);
        }

        // Listen for file drop events
        const token = PubSub.subscribe(EVENT_TOPIC_DROPPED_FILES, handleFilesDropped);

        return () => {
            // Cancelling ongoing requests
            source.cancel();

            // Unsubscribe
            PubSub.unsubscribe(token);
        }
    }, []);

    useEffect(() => {
        setLoaded(false);

        // Clear values for next route
        setContact(null);
        setMessages([]);
        setTemplateMessagesVisible(false);
        setAtBottom(false);

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
        getContact(true);

        return () => {
            // Cancelling ongoing requests
            source.cancel();
        }
    }, [waId]);

    useEffect(() => {
        props.setChosenContact(contact);
    }, [contact]);

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

    useEffect(() => {
        const messagesContainerCopy = messagesContainer.current;
        const dateIndicators = messagesContainerCopy.querySelectorAll('.chat__message__outer > .chat__message__dateContainer > .chat__message__dateContainer__indicator');

        let timeoutToken;

        // Consider replacing this with IntersectionObserver
        // Browser support should be considered: https://caniuse.com/intersectionobserver
        function handleScroll(e) {
            const threshold = 0;
            const el = e.target;
            if (isScrollable(el)) {
                if (el.scrollTop <= threshold) {
                    //console.log("Scrolled to top");
                    if (isLoaded && !isLoadingMoreMessages) {
                        setLoadingMoreMessages(true);
                        getMessages(undefined, getFirstObject(messages)?.timestamp);
                    }
                } else {
                    // TODO: Make sure user scrolls
                    if (el.scrollHeight - el.scrollTop - el.clientHeight < 1) {
                        //console.log('Scrolled to bottom');
                        if (isLoaded && !isLoadingMoreMessages && !isAtBottom) {
                            setLoadingMoreMessages(true);
                            getMessages(undefined, undefined, undefined, getLastObject(messages)?.timestamp, true, false);
                        }
                    }
                }
            }

            // Second part, to display date
            if (isLoaded) {
                clearTimeout(timeoutToken);
                timeoutToken = setTimeout(function () {
                    prepareFixedDateIndicator(dateIndicators, el);
                }, 25);
            }
        }

        if (messagesContainer && isLoaded) {
            messagesContainerCopy.addEventListener("scroll", handleScroll);

            // Display fixed date indicator
            prepareFixedDateIndicator(dateIndicators, messagesContainerCopy);
        }

        return () => {
            clearTimeout(timeoutToken);
            messagesContainerCopy.removeEventListener("scroll", handleScroll);
        }
    }, [messages, isLoaded, isLoadingMoreMessages]);

    /*useEffect(() => {
        // Scrolling to bottom on initial templates load
        if (!isLoadingTemplates) {
            const target = messagesContainer.current;
            target.scroll({top: target.scrollHeight - SCROLL_BOTTOM_OFFSET});
        }
    }, [isLoadingTemplates]);*/

    const scrollToChild = (msgId) => {
        const child = messagesContainer.current.querySelector('#message_' + msgId);
        child.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    useEffect(() => {
        const onGoToMessageId = function (msg, data) {
            const msgId = data.id;
            const timestamp = data.timestamp;
            if (messagesContainer) {
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
                        getMessages(callback, undefined, undefined, timestamp, true, true);
                    }
                }
            }
        }

        // Subscribe for scrolling to message event
        const token = PubSub.subscribe(EVENT_TOPIC_GO_TO_MSG_ID, onGoToMessageId);

        let intervalId = 0;
        if (getObjLength(messages) > 0) {
            intervalId = setInterval(() => {
                getNewMessagesTemp();
            }, 2500);

            console.log("Interval is set");
        }
        return () => {
            // Unsubscribe
            PubSub.unsubscribe(token);

            clearInterval(intervalId);
        }
    }, [messages, isAtBottom]);

    useEffect(() => {
        if (selectedFiles) {
            handleChosenFiles();
        }
    }, [selectedFiles]);

    const isScrollable = (el) => {
        const hasScrollableContent = el.scrollHeight > el.clientHeight;
        const overflowYStyle = window.getComputedStyle(el).overflowY;
        const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

        return hasScrollableContent && !isOverflowHidden;
    }

    const [optionsChatMessage, setOptionsChatMessage] = useState();
    const [menuAnchorEl, setMenuAnchorEl] = useState();

    const displayOptionsMenu = (event, chatMessage) => {
        // We need to use parent because menu view gets hidden
        setMenuAnchorEl(event.currentTarget.parentElement);
        setOptionsChatMessage(chatMessage);

        console.log(chatMessage.id);
    }

    const getContact = (loadMessages) => {
        axios.get(`${BASE_URL}contacts/${waId}/`, getConfig(undefined, source.token))
            .then((response) => {
                //console.log("Contact", response.data);

                const prepared = new ContactClass(response.data);
                setContact(prepared);
                setExpired(prepared.isExpired);

                // Contact information is loaded, now load messages
                if (loadMessages !== undefined && loadMessages === true) {
                    getMessages();
                }

            })
            .catch((error) => {
                // TODO: Handle errors

                props.displayError(error);
            });
    }

    const getMessages = (callback, beforeTime, offset, sinceTime, isInitialWithSinceTime, replaceAll) => {
        const limit = 30;

        axios.get( `${BASE_URL}messages/`,
            getConfig({
                wa_id: waId,
                offset: offset ?? 0,
                before_time: beforeTime,
                since_time: sinceTime,
                limit: limit,
            }, source.token)
        )
            .then((response) => {
                //console.log("Messages", response.data);

                const count = response.data.count;
                const previous = response.data.previous;
                const next = response.data.next;

                if (sinceTime && isInitialWithSinceTime === true) {
                    if (next) { /*count > limit*/
                        setAtBottom(false);
                        getMessages(callback, beforeTime, count - limit, sinceTime, false, replaceAll);
                        return false;
                    }
                }

                const hasNewerToLoad = previous != null && typeof previous !== typeof undefined;

                console.log("Has newer to load:", hasNewerToLoad);

                setAtBottom(!hasNewerToLoad);

                const preparedMessages = {};
                response.data.results.reverse().forEach((message) => {
                    const prepared = new ChatMessageClass(message);
                    preparedMessages[prepared.id] = prepared;
                });

                if (getObjLength(preparedMessages) > 0) {
                    // To persist scroll position, we store current scroll information
                    const prevScrollTop = messagesContainer.current.scrollTop;
                    const prevScrollHeight = messagesContainer.current.scrollHeight;

                    setMessages((prevState => {
                        if (replaceAll) {
                            return preparedMessages;
                        }

                        if (sinceTime) {
                            return {...prevState, ...preparedMessages}
                        }

                        return {...preparedMessages, ...prevState}
                    }));

                    // Persisting scroll position by calculating container height difference
                    /*if (sinceTime) {
                        messagesContainer.current.scrollTop = prevScrollTop;
                    } else {
                        const nextScrollHeight = messagesContainer.current.scrollHeight;
                        messagesContainer.current.scrollTop = (nextScrollHeight - prevScrollHeight) + prevScrollTop - SCROLL_BOTTOM_OFFSET;
                    }*/

                    if (!sinceTime || replaceAll) {
                        const nextScrollHeight = messagesContainer.current.scrollHeight;
                        messagesContainer.current.scrollTop = (nextScrollHeight - prevScrollHeight) + prevScrollTop - SCROLL_BOTTOM_OFFSET;
                    } else if (sinceTime) {
                        messagesContainer.current.scrollTop = prevScrollTop;
                    }
                }

                setLoaded(true);
                setLoadingMoreMessages(false);

                // TODO: Check unread messages first and then decide to do it or not
                // Mark messages as seen
                if (!beforeTime && !sinceTime) {
                    // beforeTime is not passed only for initial request
                    // Mark messages as seen
                    const lastMessageTimestamp = getLastMessageAndExtractTimestamp(preparedMessages);
                    markAsSeen(lastMessageTimestamp);
                }

                // Promise
                if (callback) {
                    setTimeout(function () {
                        callback();
                    }, 50);
                }

            })
            .catch((error) => {
                setLoadingMoreMessages(false);

                // TODO: Handle errors

                props.displayError(error);
            });
    }

    // Temporary solution, will be replaced with socket
    const getNewMessagesTemp = () => {
        axios.get( `${BASE_URL}messages/`,
            getConfig({
                wa_id: waId,
                offset: 0,
                limit: 30
            }, source.token)
        )
            .then((response) => {
                //console.log("Interval: Messages", response.data);

                // Display newest messages only if it is scrolled to bottom
                if (!isAtBottom) {
                    return false;
                }

                // Helper method
                function isStatusDifferent(msgJSON, existMsg) {
                    const statuses = msgJSON.waba_statuses;
                    return statuses.sent !== existMsg.sentTimestamp
                        || statuses.delivered !== existMsg.deliveredTimestamp
                        || statuses.read !== existMsg.readTimestamp
                }

                const preparedNewMessages = {};
                response.data.results.reverse().forEach((message) => {
                    const id = message.waba_payload?.id;
                    const existingMsg = messages[id];

                    // If this is a new message or already exists with a different status
                    if (existingMsg === undefined || isStatusDifferent(message, existingMsg)) {
                        const prepared = new ChatMessageClass(message);
                        preparedNewMessages[prepared.id] = prepared;
                    }
                });

                if (getObjLength(preparedNewMessages) > 0) {
                    setMessages((prevState => {
                            return { ...prevState, ...preparedNewMessages}
                        }
                    ));

                    // Mark messages as seen
                    const lastNewMessageTimestamp = getLastMessageAndExtractTimestamp(preparedNewMessages);
                    markAsSeen(lastNewMessageTimestamp);

                    // TODO: Implement a better solution after switching to websockets
                    // Check if there is a new message from customer, if yes then chat is not expired
                    if (isExpired) {
                        for (const msgId in preparedNewMessages) {
                            const msg = preparedNewMessages[msgId];
                            if (msg.isFromUs === false) {
                                if (getPastHoursByTimestamp(msg.timestamp) < 24) {
                                    //setExpired(false);

                                    // isExpired will be updated here in promise
                                    getContact(false);
                                    break;
                                }
                            }
                        }
                    }
                }
            })
            .catch((error) => {
                // TODO: Handle errors

                props.displayError(error);
            });
    }

    const sendMessage = (e) => {
        e.preventDefault();

        const preparedInput = translateHTMLInputToText(input);

        if (preparedInput.trim() === '') {
            return false;
        }

        console.log('You typed: ', preparedInput);

        if (isLoaded) {
            axios.post( `${BASE_URL}messages/`, {
                wa_id: waId,
                text: {
                    body: preparedInput.trim()
                }
            }, getConfig())
                .then((response) => {
                    console.log(response.data);

                    getNewMessagesTemp();
                })
                .catch((error) => {
                    // TODO: Handle errors

                    props.displayError(error);

                    if (error.response) {
                        // Switch to expired mode if status code is 453
                        if (error.response.status === 453) {
                            setExpired(true);
                        }
                    }

                });

            setInput('');

            // Close emoji picker
            PubSub.publish(EVENT_TOPIC_EMOJI_PICKER_VISIBILITY, false);
        }
    }

    const sendTemplateMessage = (templateMessage) => {
        if (isLoaded) {
            axios.post( `${BASE_URL}messages/`, {
                wa_id: waId,
                type: 'template',
                template: {
                    namespace: templateMessage.namespace,
                    name: templateMessage.name,
                    language: {
                        code: templateMessage.language,
                        policy: 'deterministic'
                    },
                    /*components: [{
                        type: 'body',
                        parameters: [
                            {
                                type: 'text',
                                text: templateMessage.text
                            }
                        ]
                    }]*/
                }
            }, getConfig())
                .then((response) => {
                    console.log(response.data);

                    getNewMessagesTemp();
                })
                .catch((error) => {
                    // TODO: Handle errors

                    props.displayError(error);
                });
        }
    }

    const markAsSeen = (timestamp) => {
        console.log('Marking as seen', timestamp);

        axios.post( `${BASE_URL}mark_as_seen/`, {
            timestamp: timestamp,
            customer_wa_id: waId
        }, getConfig(undefined, source.token))
            .then((response) => {
                //console.log(response.data);
            })
            .catch((error) => {
                // TODO: Handle errors

                props.displayError(error);
            });
    }

    const sendFile = (fileURL, chosenFile, callback) => {
        if (isLoaded) {
            const caption = chosenFile.caption;
            const type = chosenFile.attachmentType;
            const file = chosenFile.file;
            const filename = file.name;
            const mimeType = file.type;

            const body = {
                wa_id: waId,
                recipient_type: 'individual',
                to: waId,
                type: type
            };

            body[type] = {
                link: fileURL,
                mime_type: mimeType,
            }

            // caption param is accepted for only images and videos
            if (type === ATTACHMENT_TYPE_IMAGE || type === ATTACHMENT_TYPE_VIDEO) {
                body[type]['caption'] = caption;
            }

            // filename param is accepted for documents
            if (type === ATTACHMENT_TYPE_DOCUMENT) {
                body[type]['filename'] = filename;
            }

            axios.post( `${BASE_URL}messages/`, body, getConfig())
                .then((response) => {
                    console.log(response.data);

                    getNewMessagesTemp();

                    // Send next request
                    callback();

                })
                .catch((error) => {
                    // TODO: Handle errors

                    props.displayError(error);

                    // Send next when it fails, a retry can be considered
                    callback();
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
                    // Call next request
                    requestIndex++;
                    const nextRequest = requests[requestIndex];
                    if (nextRequest) {
                        sendRequest(nextRequest);
                    }
                }

                axios.post(`${BASE_URL}media/`, request.formData, getConfig())
                    .then((response) => {
                        console.log(response.data);

                        // Convert parameters to a ChosenFile object
                        sendFile(response.data.file, request.chosenFile, function () {
                            sendNextRequest();
                        });

                    })
                    .catch((error) => {
                        // TODO: Handle errors

                        props.displayError(error);

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

    let lastPrintedDate;

    return (
        <div
            className="chat"
            onDrop={(event) => handleDrop(event)}
            onDragOver={(event) => handleDragOver(event)}>

            <ChatHeader contact={contact} />

            <Zoom in={(isLoaded && !isLoadingMoreMessages && (fixedDateIndicatorText !== undefined && fixedDateIndicatorText.trim().length > 0))}>
                <div className="chat__body__dateIndicator">
                    <MessageDateIndicator text={fixedDateIndicatorText} />
                </div>
            </Zoom>

            <Zoom in={isLoadingMoreMessages}>
                <div className="chat__body__loadingMore">
                    <CircularProgress size={28} />
                </div>
            </Zoom>

            <div id="chat__body" className="chat__body" ref={messagesContainer} onDrop={(event) => event.preventDefault()}>
                <div className="chat__empty"/>

                { Object.entries(messages).map((message, index) => {

                    // Message date is created here and passed to ChatMessage for a better performance
                    const curMsgDate = moment.unix(message[1].timestamp);

                    if (index === 0) {
                        lastPrintedDate = undefined;
                    }

                    let willDisplayDate = false;
                    if (lastPrintedDate === undefined) {
                        willDisplayDate = true;
                        lastPrintedDate = moment.unix(message[1].timestamp);
                    } else {
                        //const curMsgDate = moment.unix(message[1].timestamp);
                        if (!curMsgDate.isSame(lastPrintedDate, 'day')) {
                            willDisplayDate = true;
                        }

                        lastPrintedDate = curMsgDate;
                    }

                    return (<ChatMessage
                        key={message[0]}
                        messageData={message[1]}
                        displayDate={willDisplayDate}
                        date={curMsgDate}
                        onPreview={(chatMessage) => props.previewMedia(chatMessage)}
                        templates={props.templates}
                        onOptionsClick={(event, chatMessage) => displayOptionsMenu(event, chatMessage)} />)
                }) }

                <div className="chat__body__empty" />
            </div>

            {isExpired
                ?
                <ChatFooterExpired />
                :
                <ChatFooter
                    input={input}
                    sendMessage={(e) => sendMessage(e)}
                    setSelectedFiles={setSelectedFiles}
                    setInput={setInput}
                    setTemplateMessagesVisible={setTemplateMessagesVisible}
                    accept={accept}
                    setAccept={setAccept} />
            }

            {(isTemplateMessagesVisible || isExpired) &&
            <TemplateMessages
                templatesData={props.templates}
                onSend={(templateMessage) => sendTemplateMessage(templateMessage)}
                isLoadingTemplates={props.isLoadingTemplates} />
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
                optionsChatMessage={optionsChatMessage} />

            {isPreviewSendMediaVisible &&
            <PreviewSendMedia
                data={previewSendMediaData}
                setData={setPreviewSendMediaData}
                setPreviewSendMediaVisible={setPreviewSendMediaVisible}
                sendHandledChosenFiles={sendHandledChosenFiles}
                accept={accept}
            />
            }

        </div>
    )
}