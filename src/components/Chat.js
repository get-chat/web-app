import React, {useEffect, useRef, useState} from 'react'
import '../styles/Chat.css'
import {CircularProgress, Snackbar, Zoom} from "@material-ui/core";
import ChatMessage from "./ChatMessage";
import {useParams} from "react-router-dom";
import axios from "axios";
import {getConfig, getLastMessageAndExtractTimestamp} from "../Helpers";
import {BASE_URL} from "../Constants";
import ChatMessageClass from "../ChatMessageClass";
import ContactClass from "../ContactClass";
import ChatFooterExpired from "./ChatFooterExpired";
import TemplateMessages from "./TemplateMessages";
import TemplateMessageClass from "../TemplateMessageClass";
import {Alert} from "@material-ui/lab";
import ChatFooter from "./ChatFooter";
import ChatHeader from "./ChatHeader";
import {getPastHoursByTimestamp} from "../DateHelpers";
import ChatMessageOptionsMenu from "./ChatMessageOptionsMenu";

const TYPE_IMAGE = 'image';
const TYPE_VIDEO = 'video';
const TYPE_AUDIO = 'audio';
const TYPE_DOCUMENT = 'document';

export default function Chat(props) {

    const messagesContainer = useRef(null);
    const [isLoaded, setLoaded] = useState(false);
    const [isLoadingMoreMessages, setLoadingMoreMessages] = useState(false);
    const [isExpired, setExpired] = useState(false);
    const [isTemplateMessagesVisible, setTemplateMessagesVisible] = useState(false);
    const [contact, setContact] = useState();
    const [messages, setMessages] = useState({});
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState();

    const [templates, setTemplates] = useState({});
    const [isLoadingTemplates, setLoadingTemplates] = useState(true);

    const [isErrorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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
                    target.scroll({top: target.scrollHeight /*, behavior: 'smooth'*/});
                }
            });
        }

        // Loading template messages
        getTemplates();

        return () => {
            // Cancelling ongoing requests
            source.cancel();
        }
    }, []);

    useEffect(() => {
        setLoaded(false);

        // Clear values for next route
        setContact(null);
        setMessages([]);
        setTemplateMessagesVisible(false);
        props.previewMedia(null);

        if (!waId) {
            console.log('waId is empty.');
            return false;
        }

        axios.get(`${BASE_URL}contacts/${waId}/`, getConfig(undefined, source.token))
            .then((response) => {
                console.log("Contact", response.data);

                const prepared = new ContactClass(response.data);
                setContact(prepared);
                setExpired(prepared.isExpired);

                // Contact information is loaded, now load messages
                getMessages();

            })
            .catch((error) => {
                // TODO: Handle errors

                displayError(error);
            });

        return () => {
            // Cancelling ongoing requests
            source.cancel();
        }
    }, [waId]);

    useEffect(() => {
        // Consider replacing this with IntersectionObserver
        // Browser support should be considered: https://caniuse.com/intersectionobserver
        function handleScroll(e) {
            const threshold = 0;
            if (isScrollable(e.target) && e.target.scrollTop <= threshold) {
                console.log("Scrolled to top");
                if (isLoaded && !isLoadingMoreMessages) {
                    setLoadingMoreMessages(true);
                    console.log();
                    getMessages(messages[Object.keys(messages)[0]]?.timestamp /*getObjLength(messages)*/);
                }
            }
        }

        const messagesContainerCopy = messagesContainer.current;

        if (messagesContainer && isLoaded) {
            messagesContainerCopy.addEventListener("scroll", handleScroll);
        }

        return () => {
            messagesContainerCopy.removeEventListener("scroll", handleScroll);
        }
    }, [messages, isLoaded, isLoadingMoreMessages]);

    useEffect(() => {
        // Scrolling to bottom on initial load
        if (!isLoadingTemplates) {
            const target = messagesContainer.current;
            target.scroll({top: target.scrollHeight});
        }
    }, [isLoadingTemplates]);

    useEffect(() => {
        let intervalId = 0;
        if (getObjLength(messages) > 0) {
            intervalId = setInterval(() => {
                getNewMessagesTemp();
            }, 2500);

            console.log("Interval is set");
        }
        return () => {
            clearInterval(intervalId);
        }
    }, [messages]);

    useEffect(() => {
        if (selectedFile) {
            uploadFile();
        }
    }, [selectedFile]);

    const isScrollable = (el) => {
        const hasScrollableContent = el.scrollHeight > el.clientHeight;
        const overflowYStyle = window.getComputedStyle(el).overflowY;
        const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

        return hasScrollableContent && !isOverflowHidden;
    }

    const getObjLength = (obj) => {
        return Object.keys(obj).length;
    }

    const [optionsChatMessage, setOptionsChatMessage] = useState();
    const [menuAnchorEl, setMenuAnchorEl] = useState();

    const displayOptionsMenu = (event, chatMessage) => {
        // We need to use parent because menu view gets hidden
        setMenuAnchorEl(event.currentTarget.parentElement);
        setOptionsChatMessage(chatMessage);

        console.log(chatMessage.id);
    }

    const getMessages = (firstMessageTimestamp) => {
        axios.get( `${BASE_URL}messages/${waId}/`,
            getConfig({
                //offset: offset ?? 0,
                before_time: firstMessageTimestamp,
                limit: 30,
            }, source.token)
        )
            .then((response) => {
                console.log("Messages", response.data);

                const preparedMessages = {};
                response.data.results.reverse().map((message, index) => {
                    const prepared = new ChatMessageClass(message);
                    preparedMessages[prepared.id] = prepared;
                });

                if (getObjLength(preparedMessages) > 0) {
                    // To persist scroll position, we store current scroll information
                    const prevScrollTop = messagesContainer.current.scrollTop;
                    const prevScrollHeight = messagesContainer.current.scrollHeight;

                    setMessages((prevState => {
                            return { ...preparedMessages, ...prevState }
                        }
                    ));

                    // Persisting scroll position by calculating container height difference
                    const nextScrollHeight = messagesContainer.current.scrollHeight;
                    messagesContainer.current.scrollTop = (nextScrollHeight - prevScrollHeight) + prevScrollTop;
                }

                setLoaded(true);
                setLoadingMoreMessages(false);

                // TODO: Check unread messages first and then decide to do it or not
                // Mark messages as seen
                if (!firstMessageTimestamp) {
                    // firstMessageTimestamp is not passed only for initial request
                    // Mark messages as seen
                    const lastMessageTimestamp = getLastMessageAndExtractTimestamp(preparedMessages);
                    markAsSeen(lastMessageTimestamp);
                }

            })
            .catch((error) => {
                setLoadingMoreMessages(false);

                // TODO: Handle errors

                displayError(error);
            });
    }

    // Temporary solution, will be replaced with socket
    const getNewMessagesTemp = () => {
        axios.get( `${BASE_URL}messages/${waId}/`,
            getConfig({
                offset: 0,
                limit: 30
            }, source.token)
        )
            .then((response) => {
                //console.log("Interval: Messages", response.data);

                const preparedNewMessages = {};
                response.data.results.reverse().map((message, index) => {
                    if (messages[message.waba_payload?.id] === undefined) {
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
                            console.log(msg.isFromUs);
                            if (msg.isFromUs === false) {
                                if (getPastHoursByTimestamp(msg.timestamp) < 24) {
                                    setExpired(false);
                                    break;
                                }
                            }
                        }
                    }
                }
            })
            .catch((error) => {
                // TODO: Handle errors

                displayError(error);
            });
    }

    const sendMessage = (e) => {
        e.preventDefault();

        if (input.trim() === '') {
            return false;
        }

        console.log('You typed: ', input);

        if (isLoaded) {
            axios.post( `${BASE_URL}messages/${waId}/`, {
                text: {
                    body: input.trim()
                }
            }, getConfig())
                .then((response) => {
                    console.log(response.data);

                    getNewMessagesTemp();
                })
                .catch((error) => {
                    // TODO: Handle errors

                    displayError(error);

                    // TODO: Switch to expired mode, if status code is: XXX


                    if (error.response) {
                        // Request made and server responded
                        if (error.response.status === 453) {
                            setExpired(true);
                        }
                    }

                });

            setInput('');
        }
    }

    const sendTemplateMessage = (templateMessage) => {
        if (isLoaded) {
            axios.post( `${BASE_URL}messages/${waId}/`, {
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

                    displayError(error);
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

                displayError(error);
            });
    }

    const getTemplates = () => {
        axios.get( `${BASE_URL}templates/`, getConfig())
            .then((response) => {
                console.log("Templates: ", response.data);

                const preparedTemplates = {};
                response.data.results.map((template, index) => {
                    const prepared = new TemplateMessageClass(template);

                    if (prepared.status === "approved") {
                        preparedTemplates[prepared.name] = prepared;
                    }
                });

                setTemplates(preparedTemplates);
                setLoadingTemplates(false);

            })
            .catch((error) => {
                // TODO: Handle errors

                displayError(error);
            });
    }

    const sendFile = (fileURL, type, filename, mimeType) => {
        if (isLoaded) {

            const body = {
                recipient_type: 'individual',
                to: waId,
                type: type
            };

            body[type] = {
                link: fileURL,
                mime_type: mimeType
            }

            // filename param is not accepted for images
            if (type !== TYPE_IMAGE && type !== TYPE_VIDEO) {
                body[type]['filename'] = filename;
            }

            axios.post( `${BASE_URL}messages/${waId}/`, body, getConfig())
                .then((response) => {
                    console.log(response.data);

                    getNewMessagesTemp();
                })
                .catch((error) => {
                    // TODO: Handle errors

                    displayError(error);
                });
        }
    }

    const uploadFile = () => {
        console.log(selectedFile);

        if (isLoaded) {
            const formData = new FormData();
            //formData.append("file_name", file.name);
            formData.append("file_encoded", selectedFile);

            const selectedFileType = selectedFile.type;
            let targetType;

            if (selectedFileType.includes('image')) {
                targetType = TYPE_IMAGE;
            } else if (selectedFileType.includes('video')) {
                targetType = TYPE_VIDEO;
            } else if (selectedFileType.includes('audio')) {
                targetType = TYPE_AUDIO;
            } else {
                targetType = TYPE_DOCUMENT;
            }

            const filename = selectedFile.name;
            const mimeType = selectedFile.type;

            axios.post(`${BASE_URL}media/`, formData, getConfig())
                .then((response) => {
                    console.log(response.data)

                    sendFile(response.data.file, targetType, filename, mimeType);

                })
                .catch((error) => {
                    // TODO: Handle errors

                    displayError(error);
                });
        }
    }

    const getSenderName = (message) => {
        return message?.senderObject?.username ?? (!message?.isFromUs ? contact?.name : "Us");
    };

    const displayError = (error) => {
        if (!axios.isCancel(error)) {
            setErrorMessage(error.response?.data?.reason ?? 'An error has occurred.');
            setErrorVisible(true);
        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setErrorVisible(false);
    };

    return (
        <div className="chat">

            <ChatHeader contact={contact} />

            <div id="chat__body" className="chat__body" ref={messagesContainer}>
                <Zoom in={isLoadingMoreMessages}>
                    <div className="chat__body__loadingMore">
                        <CircularProgress size={28} />
                    </div>
                </Zoom>
                <div className="chat__empty"/>

                { Object.entries(messages).map((message, index) =>
                    <ChatMessage
                        key={message[0]}
                        name={getSenderName(message[1])}
                        messageData={message[1]}
                        onPreview={(chatMessage) => props.previewMedia(chatMessage)}
                        templates={templates}
                        onOptionsClick={(event, chatMessage) => displayOptionsMenu(event, chatMessage)} />
                )}

                <div className="chat__body__empty" />
            </div>

            {isExpired
                ?
                <ChatFooterExpired />
                :
                <ChatFooter
                    input={input}
                    sendMessage={(e) => sendMessage(e)}
                    setSelectedFile={setSelectedFile}
                    setInput={setInput}
                    setTemplateMessagesVisible={setTemplateMessagesVisible} />
            }

            {(isTemplateMessagesVisible || isExpired) &&
            <TemplateMessages
                templatesData={templates}
                onSend={(templateMessage) => sendTemplateMessage(templateMessage)}
                isLoadingTemplates={isLoadingTemplates} />
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

            <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "left" }} open={isErrorVisible} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error">
                    {errorMessage}
                </Alert>
            </Snackbar>

        </div>
    )
}