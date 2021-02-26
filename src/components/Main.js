import React, {useEffect, useState} from 'react';
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import {Avatar, Fade, IconButton, Snackbar} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import PubSub from "pubsub-js";
import axios from "axios";
import {getConfig, getToken} from "../Helpers";
import {useParams} from "react-router-dom";
import {avatarStyles} from "../AvatarStyles";
import SearchMessage from "./SearchMessage";
import ContactDetails from "./ContactDetails";
import LoadingScreen from "./LoadingScreen";
import TemplateMessageClass from "../TemplateMessageClass";
import {Alert} from "@material-ui/lab";
import {
    BASE_URL,
    CALENDAR_NORMAL,
    EVENT_TOPIC_CHAT_MESSAGE,
    EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, EVENT_TOPIC_NEW_CHAT_MESSAGES,
    EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY
} from "../Constants";
import Moment from "react-moment";
import ChatMessageClass from "../ChatMessageClass";

function Main() {

    const {waId} = useParams();

    const [progress, setProgress] = useState(20);
    const [checked, setChecked] = React.useState(false);

    const [templates, setTemplates] = useState({});
    const [isLoadingTemplates, setLoadingTemplates] = useState(true);
    const [templatesReady, setTemplatesReady] = useState(false);

    const [isErrorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [chatMessageToPreview, setChatMessageToPreview] = useState();
    const [isSearchMessagesVisible, setSearchMessagesVisible] = useState(false);
    const [isContactDetailsVisible, setContactDetailsVisible] = useState(false);
    const [chosenContact, setChosenContact] = useState();

    const avatarClasses = avatarStyles();

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

    const hideImageOrVideoPreview = () => {
        setChatMessageToPreview(null);
    }

    const previewMedia = (chatMessage) => {
        if (!chatMessage) {
            hideImageOrVideoPreview();
            return false;
        }

        // Pause any playing audios
        PubSub.publishSync(EVENT_TOPIC_CHAT_MESSAGE, 'pause');

        setChatMessageToPreview(chatMessage);
    }

    const showNotification = (title, body, icon) => {
        function showNot() {
            // eslint-disable-next-line no-unused-vars
            const notification = new Notification(title, {
                body: body,
                icon: icon
            });
            /*notification.onclick = function (event) {}*/
        }
        if (!window.Notification) {
            console.log('Browser does not support notifications.');
        } else {
            // Check if permission is already granted
            if (Notification.permission === 'granted') {
                showNot();
            } else {
                // request permission from user
                Notification.requestPermission().then(function (p) {
                    if (p === 'granted') {
                        showNot();
                    } else {
                        console.log('User blocked notifications.');
                    }
                }).catch(function (err) {
                    console.error(err);
                });
            }
        }
    }

    const onSearchMessagesVisibilityEvent = function (msg, data) {
        setSearchMessagesVisible(data);

        // Hide other sections
        if (data === true) {
            setContactDetailsVisible(false);
        }
    };

    const onContactDetailsVisibilityEvent = function (msg, data) {
        setContactDetailsVisible(data);

        // Hide other sections
        if (data === true) {
            setSearchMessagesVisible(false);
        }
    };

    useEffect(() => {
        // Loading template messages
        getTemplates();

        // EventBus
        const token1 = PubSub.subscribe(EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY, onSearchMessagesVisibilityEvent);
        const token2 = PubSub.subscribe(EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, onContactDetailsVisibilityEvent);

        // WebSocket, consider a separate env variable for ws address
        const ws = new WebSocket('wss://websockets.whatsapp.kondz.io/');

        ws.onopen = function (event) {
            console.log('Connected to websocket server.');

            ws.send(JSON.stringify({token: getToken()}));
        }

        ws.onmessage = function (event) {
            console.log('New message:', event.data);

            try {
                const data = JSON.parse(event.data);

                if (data.type === 'message' && data.message) {
                    const preparedMessages = {};
                    const messageObj = new ChatMessageClass(data.message);
                    preparedMessages[messageObj.id] = messageObj;

                    PubSub.publish(EVENT_TOPIC_NEW_CHAT_MESSAGES, preparedMessages);
                }

                // Switched to event type: message
                /*if (data.type === 'waba_webhook') {
                    const wabaPayload = data.waba_payload;
                    const contacts = wabaPayload?.contacts;
                    const messages = wabaPayload?.messages;

                    if (contacts && messages) {
                        // Prepare contacts
                        const preparedContacts = {};
                        contacts.forEach((contact) => {
                            preparedContacts[contact.wa_id] = {
                                wa_id: contact.wa_id,
                                waba_payload: {
                                    profile: contact.profile
                                }
                            }
                        });

                        // Prepare messages and match with related contacts
                        const preparedMessages = {};
                        messages.forEach((message) => {
                            const msgData = {
                                contact: preparedContacts[message.from],
                                customer_wa_id: message.from,
                                from_us: false, // This might change later
                                waba_payload: message,
                                waba_statuses: {}
                            };

                            preparedMessages[message.id] = new ChatMessageClass(msgData);
                        });

                        //console.log(preparedMessages);
                        PubSub.publish(EVENT_TOPIC_NEW_CHAT_MESSAGES, preparedMessages);
                    }
                }*/

            } catch (error) {
                console.error(error);
            }
        }

        return () => {
            PubSub.unsubscribe(token1);
            PubSub.unsubscribe(token2);

            ws.close();
        }
    }, []);

    /*useEffect(() => {
        if (progress === 99) {
            setTimeout(function () {
                setProgress(100);
            }, 500);
        }
    }, [progress]);*/

    useEffect(() => {
        setChecked(true);

        return () => {
            // Hide search messages container
            setSearchMessagesVisible(false);
        }
    }, [waId]);

    const getTemplates = () => {
        axios.get( `${BASE_URL}templates/`, getConfig())
            .then((response) => {
                //console.log("Templates: ", response.data);

                const preparedTemplates = {};
                response.data.results.forEach((template) => {
                    const prepared = new TemplateMessageClass(template);

                    if (prepared.status === "approved") {
                        preparedTemplates[prepared.name] = prepared;
                    }
                });

                setTemplates(preparedTemplates);
                setLoadingTemplates(false);
                setTemplatesReady(true);

                setProgress(40);

            })
            .catch((error) => {
                // TODO: Handle errors

                displayError(error);
            });
    }

    return (
        <Fade in={checked}>
            <div className="app__body">

                {templatesReady &&
                <Sidebar
                    setProgress={setProgress}
                    showNotification={showNotification}
                />
                }

                {templatesReady &&
                <Chat
                    setChosenContact={setChosenContact}
                    previewMedia={(chatMessage) => previewMedia(chatMessage)}
                    templates={templates}
                    isLoadingTemplates={isLoadingTemplates}
                    displayError={(error) => displayError(error)}
                />
                }

                {isSearchMessagesVisible &&
                <SearchMessage />
                }

                {isContactDetailsVisible &&
                <ContactDetails contactData={chosenContact} />
                }

                {chatMessageToPreview &&
                <div className="app__imagePreview">
                    <div className="app__imagePreview__header">

                        <Avatar className={avatarClasses[chatMessageToPreview.preparedAvatarClassName]}>{chatMessageToPreview.preparedInitials}</Avatar>
                        <div className="app_imagePreview__header__senderInfo">
                            <h3>{chatMessageToPreview.senderName}</h3>
                            <span><Moment calendar={CALENDAR_NORMAL} date={chatMessageToPreview.timestamp} unix /></span>
                        </div>

                        <IconButton className="app__imagePreview__close" onClick={() => hideImageOrVideoPreview()}>
                            <CloseIcon fontSize="large" />
                        </IconButton>
                    </div>
                    <div className="app__imagePreview__container" onClick={() => hideImageOrVideoPreview()}>
                        {(chatMessageToPreview.imageId || chatMessageToPreview.imageLink) &&
                        <img className="app__imagePreview__image" src={chatMessageToPreview.generateImageLink()} alt="Preview"/>
                        }
                        {(chatMessageToPreview.videoId || chatMessageToPreview.videoLink) &&
                        <video className="app__imagePreview__video" src={chatMessageToPreview.generateVideoLink()} controls autoPlay={true} />
                        }
                    </div>
                </div>
                }

                <Fade in={progress < 100} timeout={{exit: 1000}}>
                    <div className="loadingScreenOuter">
                        <LoadingScreen progress={progress}/>
                    </div>
                </Fade>

                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "left" }} open={isErrorVisible} autoHideDuration={6000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity="error">
                        {errorMessage}
                    </Alert>
                </Snackbar>

            </div>
        </Fade>
    )
}

export default Main;