import React, {useEffect, useState} from 'react';
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import {Fade, Snackbar} from "@material-ui/core";
import PubSub from "pubsub-js";
import axios from "axios";
import {getConfig, getWebSocketURL} from "../Helpers";
import {useHistory, useLocation, useParams} from "react-router-dom";
import SearchMessage from "./SearchMessage";
import ContactDetails from "./ContactDetails";
import LoadingScreen from "./LoadingScreen";
import TemplateMessageClass from "../TemplateMessageClass";
import {Alert} from "@material-ui/lab";
import {
    BASE_URL,
    EVENT_TOPIC_CHAT_MESSAGE,
    EVENT_TOPIC_CHAT_MESSAGE_STATUS_CHANGE,
    EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY,
    EVENT_TOPIC_DISPLAY_ERROR,
    EVENT_TOPIC_NEW_CHAT_MESSAGES,
    EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY
} from "../Constants";
import ChatMessageClass from "../ChatMessageClass";
import PreviewMedia from "./PreviewMedia";
import logo from '../assets/images/logo.png';
import {
    clearContactProvidersData,
    clearToken,
    getContactProvidersData,
    getToken,
    storeContactProvidersData
} from "../StorageHelper";
import ChatAssignment from "./ChatAssignment";
import ChatTags from "./ChatTags";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function Main() {

    const {waId} = useParams();

    const [progress, _setProgress] = useState(20);
    const [checked, setChecked] = useState(false);

    const [currentUser, setCurrentUser] = useState();
    const [isAdmin, setAdmin] = useState(false);

    const [chats, setChats] = useState({});

    const [templates, setTemplates] = useState({});
    const [isLoadingTemplates, setLoadingTemplates] = useState(true);
    const [templatesReady, setTemplatesReady] = useState(false);

    const [isErrorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [chatMessageToPreview, setChatMessageToPreview] = useState();
    const [isSearchMessagesVisible, setSearchMessagesVisible] = useState(false);
    const [isContactDetailsVisible, setContactDetailsVisible] = useState(false);
    const [isChatAssignmentVisible, setChatAssignmentVisible] = useState(false);
    const [isChatTagsVisible, setChatTagsVisible] = useState(false);
    const [chosenContact, setChosenContact] = useState();

    const [contactProvidersData, setContactProvidersData] = useState(getContactProvidersData());

    const history = useHistory();
    const location = useLocation();
    const query = useQuery();

    const checkIsChatOnly = () => {
        return query.get('chatonly') === '1';
    }

    const [isChatOnly,] = useState(checkIsChatOnly());

    const setProgress = (value) => {
        _setProgress(prevState => {
            return value > prevState ? value : prevState;
        })
    }

    const displayError = (error) => {
        if (!axios.isCancel(error)) {
            setErrorMessage(error.response?.data?.reason ?? 'An error has occurred.');
            setErrorVisible(true);
        }
    }

    const displayCustomError = (errorMessage) => {
        setErrorMessage(errorMessage);
        setErrorVisible(true);
    }

    const clearUserSession = (errorCase, nextLocation) => {
        clearToken();
        clearContactProvidersData();

        let path;

        if (errorCase) {
            path = `/login/error/${errorCase}`;
        } else {
            path = "/";
        }

        history.push({
            'pathname': path,
            'nextPath': nextLocation?.pathname,
            'search': nextLocation?.search
        });
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

    const goToChatByWaId = (_waId) => {
        history.push(`/main/chat/${_waId}`);
    }

    const displayNotification = (title, body, chatWaId) => {
        if (isChatOnly) return;

        // Android web app interface
        if (window.AndroidWebInterface) {
            window.AndroidWebInterface.displayNotification(title, body, chatWaId);
        }

        function displayNtf() {
            // eslint-disable-next-line no-unused-vars
            const notification = new Notification(title, {
                body: body,
                icon: logo
            });

            notification.onclick = function (event) {
                window.focus();

                if (waId) {
                    goToChatByWaId(chatWaId);
                }
            }
        }
        if (!window.Notification) {
            console.log('Browser does not support notifications.');
        } else {
            // Check if permission is already granted
            if (Notification.permission === 'granted') {
                displayNtf();
            } else {
                // request permission from user
                Notification.requestPermission().then(function (p) {
                    if (p === 'granted') {
                        displayNtf();
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

    const onDisplayError = function (msg, data) {
        displayCustomError(data);
    };

    useEffect(() => {
        // Display custom errors in any component
        window.displayCustomError = displayCustomError;

        // Display Axios errors in any component
        window.displayError = displayError;

        // We assign this method to window, to be able to call it from outside (eg: mobile app)
        window.goToChatByWaId = goToChatByWaId;

        if (!getToken()) {
            clearUserSession("notLoggedIn", location);
        }

        // Retrieve current user, this will trigger other requests
        retrieveCurrentUser();

        // EventBus
        const searchMessagesVisibilityEventToken = PubSub.subscribe(EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY, onSearchMessagesVisibilityEvent);
        const contactDetailsVisibilityEventToken = PubSub.subscribe(EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, onContactDetailsVisibilityEvent);
        const displayErrorEventToken = PubSub.subscribe(EVENT_TOPIC_DISPLAY_ERROR, onDisplayError);

        const CODE_NORMAL = 1000;
        let ws;

        let socketClosedAt;

        const connect = () => {
            console.log('Connecting to websocket server');

            // WebSocket, consider a separate env variable for ws address
            ws = new WebSocket(getWebSocketURL());

            ws.onopen = function (event) {
                console.log('Connected to websocket server.');

                ws.send(JSON.stringify({token: getToken()}));

                if (socketClosedAt) {
                    const now = new Date();
                    const differenceInMinutes = Math.abs(now.getTime() - socketClosedAt.getTime()) / 1000 / 60;

                    console.log(differenceInMinutes);

                    // If window was blurred for more than 3 hours
                    if (differenceInMinutes >= 5) {
                        window.location.reload();
                    } else {
                        socketClosedAt = undefined;
                    }
                }
            }

            ws.onclose = function (event) {
                if (event.code !== CODE_NORMAL) {
                    console.log('Retrying connection to websocket server in 1 second.');

                    socketClosedAt = new Date();

                    setTimeout(function () {
                        connect();
                    }, 1000);
                }
            }

            ws.onerror = function (event) {
                ws.close();
            }

            ws.onmessage = function (event) {
                console.log('New message:', event.data);

                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'waba_webhook') {
                        const wabaPayload = data.waba_payload;

                        // Incoming messages
                        const incomingMessages = wabaPayload?.incoming_messages;

                        if (incomingMessages) {
                            const preparedMessages = {};

                            incomingMessages.forEach((message) => {
                                const messageObj = new ChatMessageClass(message);
                                preparedMessages[messageObj.id] = messageObj;
                            });

                            PubSub.publish(EVENT_TOPIC_NEW_CHAT_MESSAGES, preparedMessages);
                        }

                        // Outgoing messages
                        const outgoingMessages = wabaPayload?.outgoing_messages;

                        if (outgoingMessages) {
                            const preparedMessages = {};

                            outgoingMessages.forEach((message) => {
                                const messageObj = new ChatMessageClass(message);
                                preparedMessages[messageObj.id] = messageObj;
                            });

                            PubSub.publish(EVENT_TOPIC_NEW_CHAT_MESSAGES, preparedMessages);
                        }

                        // Statuses
                        const statuses = wabaPayload?.statuses;

                        if (statuses) {
                            const preparedStatuses = {};
                            statuses.forEach((statusObj) => {
                                if (!preparedStatuses.hasOwnProperty(statusObj.id)) {
                                    preparedStatuses[statusObj.id] = {};
                                }

                                if (statusObj.status === 'sent') {
                                    preparedStatuses[statusObj.id].sentTimestamp = statusObj.timestamp;
                                }

                                if (statusObj.status === 'delivered') {
                                    preparedStatuses[statusObj.id].deliveredTimestamp = statusObj.timestamp;
                                }

                                if (statusObj.status === 'read') {
                                    preparedStatuses[statusObj.id].readTimestamp = statusObj.timestamp;
                                }
                            });

                            PubSub.publish(EVENT_TOPIC_CHAT_MESSAGE_STATUS_CHANGE, preparedStatuses);
                        }
                    }

                } catch (error) {
                    console.error(error);
                }
            }
        }

        connect();

        return () => {
            PubSub.unsubscribe(searchMessagesVisibilityEventToken);
            PubSub.unsubscribe(contactDetailsVisibilityEventToken);
            PubSub.unsubscribe(displayErrorEventToken);

            ws.close(CODE_NORMAL);
        }
    }, []);

    useEffect(() => {
        setChecked(true);

        return () => {
            // Hide search messages container
            setSearchMessagesVisible(false);

            // Hide contact details
            setContactDetailsVisible(false);

            // Hide chat assignment
            setChatAssignmentVisible(false);
        }
    }, [waId]);

    useEffect(() => {
        storeContactProvidersData(contactProvidersData);
    }, [contactProvidersData]);

    const retrieveCurrentUser = () => {
        axios.get( `${BASE_URL}users/current/`, getConfig())
            .then((response) => {
                console.log("User: ", response.data);

                setCurrentUser(response.data);

                const role = response.data?.profile?.role;

                // Only admins and users can access
                if (role !== "admin" && role !== "user") {
                    clearUserSession("incorrectRole", location);
                }

                // Check if role is admin
                const tempIsAdmin = role === "admin";
                setAdmin(tempIsAdmin);

                setProgress(30);

                // Trigger next request
                getTemplates();

            })
            .catch((error) => {
                // TODO: Move this to a common interceptor
                if (error.response) {
                    if (error.response.status === 401) {
                        // Invalid token
                        console.log(location)
                        clearUserSession("invalidToken", location);
                    }
                }

                displayError(error);
            });
    }

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

                setProgress(50);

            })
            .catch((error) => {
                // TODO: Handle errors

                displayError(error);
            });
    }

    const retrieveContactData = (personWaId) => {
        if (contactProvidersData?.[personWaId] !== undefined) {
            // Already retrieved
            return;
        }

        axios.get( `${BASE_URL}contacts/${personWaId}`, getConfig())
            .then((response) => {
                console.log("Contact: ", response.data);

                setContactProvidersData(prevState => {
                    prevState[personWaId] = response.data.contact_provider_results;
                    return {...prevState};
                })
            })
            .catch((error) => {
                displayError(error);
            });
    }

    return (
        <Fade in={checked}>
            <div className="app__body">

                {templatesReady &&
                <Sidebar
                    isAdmin={isAdmin}
                    chats={chats}
                    setChats={setChats}
                    currentUser={currentUser}
                    setProgress={setProgress}
                    displayNotification={displayNotification}
                    clearUserSession={clearUserSession}
                    contactProvidersData={contactProvidersData}
                    retrieveContactData={retrieveContactData}
                    isChatOnly={isChatOnly} />
                }

                {templatesReady &&
                <Chat
                    isAdmin={isAdmin}
                    setChosenContact={setChosenContact}
                    previewMedia={(chatMessage) => previewMedia(chatMessage)}
                    templates={templates}
                    isLoadingTemplates={isLoadingTemplates}
                    clearUserSession={clearUserSession}
                    contactProvidersData={contactProvidersData}
                    retrieveContactData={retrieveContactData}
                    isChatOnly={isChatOnly}
                    setChatAssignmentVisible={setChatAssignmentVisible}
                    setChatTagsVisible={setChatTagsVisible} />
                }

                {isSearchMessagesVisible &&
                <SearchMessage />
                }

                {isContactDetailsVisible &&
                <ContactDetails
                    contactData={chosenContact}
                    contactProvidersData={contactProvidersData}
                    retrieveContactData={retrieveContactData}
                    chats={chats} />
                }

                {isChatAssignmentVisible &&
                <ChatAssignment
                    waId={waId}
                    open={isChatAssignmentVisible}
                    setOpen={setChatAssignmentVisible} />
                }

                {isChatTagsVisible &&
                <ChatTags
                    waId={waId}
                    open={isChatTagsVisible}
                    setOpen={setChatTagsVisible}
                />
                }

                {chatMessageToPreview &&
                <PreviewMedia
                    data={chatMessageToPreview}
                    hideImageOrVideoPreview={hideImageOrVideoPreview} />
                }

                <Fade in={progress < 100} timeout={{exit: 1000}}>
                    <div className="loadingScreenOuter">
                        <LoadingScreen
                            progress={progress}
                            setProgress={setProgress} />
                    </div>
                </Fade>

                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "left" }} open={isErrorVisible} autoHideDuration={6000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity="error" elevation={4}>
                        {errorMessage}
                    </Alert>
                </Snackbar>

            </div>
        </Fade>
    )
}

export default Main;