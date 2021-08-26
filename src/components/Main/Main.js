import React, {useEffect, useState} from 'react';
import Sidebar from "./Sidebar/Sidebar";
import Chat from "./Chat/Chat";
import {Fade, Snackbar} from "@material-ui/core";
import PubSub from "pubsub-js";
import axios from "axios";
import {useHistory, useLocation, useParams} from "react-router-dom";
import SearchMessage from "../SearchMessage";
import ContactDetails from "./ContactDetails";
import LoadingScreen from "./LoadingScreen";
import TemplateMessageClass from "../../TemplateMessageClass";
import {Alert} from "@material-ui/lab";
import {
    EVENT_TOPIC_BULK_MESSAGE_TASK,
    EVENT_TOPIC_BULK_MESSAGE_TASK_ELEMENT,
    EVENT_TOPIC_BULK_MESSAGE_TASK_STARTED,
    EVENT_TOPIC_CHAT_ASSIGNMENT,
    EVENT_TOPIC_CHAT_MESSAGE,
    EVENT_TOPIC_CHAT_MESSAGE_STATUS_CHANGE,
    EVENT_TOPIC_CHAT_TAGGING,
    EVENT_TOPIC_CLEAR_TEXT_MESSAGE_INPUT,
    EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY,
    EVENT_TOPIC_DISPLAY_ERROR,
    EVENT_TOPIC_MARKED_AS_RECEIVED,
    EVENT_TOPIC_NEW_CHAT_MESSAGES,
    EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY,
    EVENT_TOPIC_UNSUPPORTED_FILE
} from "../../Constants";
import ChatMessageClass from "../../ChatMessageClass";
import PreviewMedia from "./PreviewMedia";
import logo from '../../assets/images/logo.png';
import {getContactProvidersData, getToken, storeContactProvidersData} from "../../helpers/StorageHelper";
import ChatAssignment from "./ChatAssignment";
import ChatTags from "./ChatTags";
import ChatTagsList from "./ChatTagsList";
import DownloadUnsupportedFile from "../DownloadUnsupportedFile";
import SavedResponseClass from "../../SavedResponseClass";
import moment from "moment";
import UserClass from "../../UserClass";
import {
    bulkSendCall,
    createSavedResponseCall,
    deleteSavedResponseCall,
    listContactsCall,
    listSavedResponsesCall,
    listTagsCall,
    listTemplatesCall,
    listUsersCall,
    resolveContactCall,
    retrieveCurrentUserCall
} from "../../api/ApiCalls";
import {clearUserSession} from "../../helpers/ApiHelper";
import BulkMessageTaskElementClass from "../../BulkMessageTaskElementClass";
import BulkMessageTaskClass from "../../BulkMessageTaskClass";
import {getWebSocketURL} from "../../helpers/URLHelper";
import {preparePhoneNumber} from "../../helpers/PhoneNumberHelper";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function Main() {

    const {waId} = useParams();

    const [progress, _setProgress] = useState(0);
    const [loadingNow, setLoadingNow] = useState('');

    const [checked, setChecked] = useState(false);
    const [isBlurred, setBlurred] = useState(false);

    const [currentUser, setCurrentUser] = useState();
    const [users, setUsers] = useState({});
    const [isAdmin, setAdmin] = useState(false);

    const [chats, setChats] = useState({});
    const [newMessages, setNewMessages] = useState({});
    const [filterTag, setFilterTag] = useState();

    const [templates, setTemplates] = useState({});
    const [savedResponses, setSavedResponses] = useState({});
    const [isLoadingTemplates, setLoadingTemplates] = useState(true);
    const [templatesReady, setTemplatesReady] = useState(false);

    const [tags, setTags] = useState([]);

    const [isSuccessVisible, setSuccessVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isErrorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [chatMessageToPreview, setChatMessageToPreview] = useState();

    const [isSearchMessagesVisible, setSearchMessagesVisible] = useState(false);
    const [isContactDetailsVisible, setContactDetailsVisible] = useState(false);
    const [isChatAssignmentVisible, setChatAssignmentVisible] = useState(false);
    const [isChatTagsVisible, setChatTagsVisible] = useState(false);
    const [isChatTagsListVisible, setChatTagsListVisible] = useState(false);
    const [isDownloadUnsupportedFileVisible, setDownloadUnsupportedFileVisible] = useState(false);

    const [unsupportedFile, setUnsupportedFile] = useState();

    const [chosenContact, setChosenContact] = useState();

    const [contactProvidersData, setContactProvidersData] = useState(getContactProvidersData());

    const [isSelectionModeEnabled, setSelectionModeEnabled] = useState(false);
    const [selectedChats, setSelectedChats] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [bulkSendPayload, setBulkSendPayload] = useState();

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

    const displaySuccess = (message) => {
        setSuccessMessage(message);
        setSuccessVisible(true);
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

    const handleSuccessClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSuccessVisible(false);
    };

    const handleErrorClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setErrorVisible(false);
    };

    const finishBulkSendMessage = () => {
        const requestPayload = {};
        const messagePayload = {...bulkSendPayload};
        const recipients = selectedChats;
        const tags = selectedTags;

        const preparedRecipients = [];
        recipients.forEach((recipient) => {
            preparedRecipients.push({"recipient": recipient});
        });

        const preparedTags = [];
        tags.forEach((tag) => {
            preparedTags.push({"tag_id": tag});
        });

        requestPayload.recipients = preparedRecipients;
        requestPayload.tags = preparedTags;
        requestPayload.payload = messagePayload;

        bulkSendCall(requestPayload, (response) => {
            // Disable selection mode
            setSelectionModeEnabled(false);

            // Clear selections
            setSelectedChats([]);
            setSelectedTags([]);

            // Clear input if text message
            if (messagePayload.type === 'text') {
                PubSub.publish(EVENT_TOPIC_CLEAR_TEXT_MESSAGE_INPUT);
            }

            const preparedBulkMessageTask = new BulkMessageTaskClass(response.data);
            PubSub.publish(EVENT_TOPIC_BULK_MESSAGE_TASK_STARTED, preparedBulkMessageTask);
        });
    }

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
                icon: logo,
                tag: chatWaId + moment().seconds(0).milliseconds(0).toISOString()
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

        // Display success in any component
        window.displaySuccess = displaySuccess;

        // Display Axios errors in any component
        window.displayError = displayError;

        // We assign this method to window, to be able to call it from outside (eg: mobile app)
        window.goToChatByWaId = goToChatByWaId;

        if (!getToken()) {
            clearUserSession("notLoggedIn", location, history);
        }

        // Retrieve current user, this will trigger other requests
        retrieveCurrentUser();

        const onUnsupportedFileEvent = function (msg, data) {
            setUnsupportedFile(data);
            setDownloadUnsupportedFileVisible(true);
        };

        // EventBus
        const searchMessagesVisibilityEventToken = PubSub.subscribe(EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY, onSearchMessagesVisibilityEvent);
        const contactDetailsVisibilityEventToken = PubSub.subscribe(EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, onContactDetailsVisibilityEvent);
        const displayErrorEventToken = PubSub.subscribe(EVENT_TOPIC_DISPLAY_ERROR, onDisplayError);
        const unsupportedFileEventToken = PubSub.subscribe(EVENT_TOPIC_UNSUPPORTED_FILE, onUnsupportedFileEvent);

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

                        // Chat assignment
                        const chatAssignment = wabaPayload?.chat_assignment;

                        if (chatAssignment) {
                            const preparedMessages = {};
                            const prepared = ChatMessageClass.fromAssignmentEvent(chatAssignment);
                            preparedMessages[prepared.id] = prepared;

                            PubSub.publish(EVENT_TOPIC_CHAT_ASSIGNMENT, preparedMessages);

                            // Update chats
                            setChats(prevState => {
                                if (prevState.hasOwnProperty(prepared.waId)) {
                                    prevState[prepared.waId].assignedToUser = prepared.assignmentEvent.assigned_to_user_set;
                                    prevState[prepared.waId].assignedGroup = prepared.assignmentEvent.assigned_group_set;
                                    return {...prevState};
                                }

                                return prevState;
                            });
                        }

                        // Chat tagging
                        const chatTagging = wabaPayload?.chat_tagging;

                        if (chatTagging) {
                            const preparedMessages = {};
                            const prepared = ChatMessageClass.fromTaggingEvent(chatTagging);
                            preparedMessages[prepared.id] = prepared;

                            PubSub.publish(EVENT_TOPIC_CHAT_TAGGING, preparedMessages);

                            // Update chats
                            setChats(prevState => {
                                if (prevState.hasOwnProperty(prepared.waId)) {
                                    if (chatTagging.action === "added") {
                                        prevState[prepared.waId].tags.push(prepared.taggingEvent.tag);
                                    } else if (chatTagging.action === "removed") {
                                        prevState[prepared.waId].tags = prevState[prepared.waId].tags.filter((tag) => {
                                            return tag.id !== prepared.taggingEvent.tag.id;
                                        });
                                    }

                                    return {...prevState};
                                }

                                return prevState;
                            });
                        }

                        const bulkMessageTasks = wabaPayload?.bulk_message_tasks;

                        if (bulkMessageTasks) {
                            console.log(bulkMessageTasks);

                            const preparedBulkMessageTasks = {};

                            bulkMessageTasks.forEach((task) => {
                                const prepared = new BulkMessageTaskClass(task);
                                preparedBulkMessageTasks[prepared.id] = prepared;
                            });

                            PubSub.publish(EVENT_TOPIC_BULK_MESSAGE_TASK, preparedBulkMessageTasks);
                        }

                        const bulkMessageTaskElements = wabaPayload?.bulk_message_task_elements;

                        if (bulkMessageTaskElements) {
                            console.log(bulkMessageTaskElements);

                            const preparedBulkMessageTaskElements = {};

                            bulkMessageTaskElements.forEach((element) => {
                                const prepared = new BulkMessageTaskElementClass(element);
                                preparedBulkMessageTaskElements[prepared.id] = prepared;
                            });

                            PubSub.publish(EVENT_TOPIC_BULK_MESSAGE_TASK_ELEMENT, preparedBulkMessageTaskElements);
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
            PubSub.unsubscribe(unsupportedFileEventToken);

            ws.close(CODE_NORMAL);
        }
    }, []);

    useEffect(() => {
        function onBlur(event) {
            setBlurred(true);
        }

        function onFocus(event) {
            setBlurred(false);
        }

        window.addEventListener('blur', onBlur);
        window.addEventListener('focus', onFocus);

        return () => {
            window.removeEventListener('blur', onBlur);
            window.removeEventListener('focus', onFocus);
        }
    }, [isBlurred]);

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
        const onMarkedAsReceived = function (msg, data) {
            const relatedWaId = data;

            setNewMessages(prevState => {
                const nextState = prevState;
                delete nextState[relatedWaId];

                return {...nextState};
            });
        }

        const markedAsReceivedEventToken = PubSub.subscribe(EVENT_TOPIC_MARKED_AS_RECEIVED, onMarkedAsReceived);

        return () => {
            PubSub.unsubscribe(markedAsReceivedEventToken);
        }
    }, [newMessages]);

    useEffect(() => {
        storeContactProvidersData(contactProvidersData);
    }, [contactProvidersData]);

    // Clear selected chats and tags when bulk send payload changes
    useEffect(() => {
        if (bulkSendPayload) {
            setSelectedChats([]);
            setSelectedTags([]);
        }
    }, [bulkSendPayload])

    const listUsers = () => {
        setLoadingNow('users');

        listUsersCall(5000, (response) => {
            const preparedUsers = {};
            response.data.results.forEach((user) => {
                const prepared = new UserClass(user);
                preparedUsers[prepared.id] = prepared;
            });

            setUsers(preparedUsers);

            setProgress(20);

            // Trigger next request
            listContacts();
        });
    }

    const retrieveCurrentUser = () => {
        setLoadingNow('current user');

        retrieveCurrentUserCall((response) => {
            setCurrentUser(response.data);

            const role = response.data?.profile?.role;

            // Only admins and users can access
            if (role !== "admin" && role !== "user") {
                clearUserSession("incorrectRole", location, history);
            }

            // Check if role is admin
            const tempIsAdmin = role === "admin";
            setAdmin(tempIsAdmin);

            setProgress(10);

            // Trigger next request
            listUsers();
        }, history);
    }

    const listTemplates = () => {
        setLoadingNow('templates');

        const completeCallback = () => {
            setLoadingTemplates(false);
            setTemplatesReady(true);

            setProgress(70);
        };

        listTemplatesCall((response) => {
            const preparedTemplates = {};
            response.data.results.forEach((template) => {
                const prepared = new TemplateMessageClass(template);

                if (prepared.status === "approved") {
                    preparedTemplates[prepared.name] = prepared;
                }
            });

            setTemplates(preparedTemplates);

            completeCallback();

            // Trigger next request
            listTags();
        }, (error) => {
            if (error.response) {
                const status = error.response.status;
                // Status code >= 500 means template management is not available
                if (status >= 500) {
                    const reason = error.response.data?.reason;
                    displayCustomError(reason);
                    completeCallback();
                } else {
                    window.displayError(error);
                }
            } else {
                window.displayError(error);
            }
        });
    }

    const listSavedResponses = () => {
        listSavedResponsesCall((response) => {
            const preparedSavedResponses = {};
            response.data.results.forEach((savedResponse) => {
                const prepared = new SavedResponseClass(savedResponse);
                preparedSavedResponses[prepared.id] = prepared;
            });

            setSavedResponses(preparedSavedResponses);

            setProgress(50);

            // Trigger next request
            listTemplates();
        });
    }

    const createSavedResponse = (text) => {
        createSavedResponseCall(text, (response) => {
            // Display a success message
            displaySuccess("Saved as response successfully!");

            // Reload saved responses
            listSavedResponses();
        });
    }

    const deleteSavedResponse = (id) => {
        deleteSavedResponseCall(id, (response) => {
            // Display a success message
            displaySuccess("Deleted response successfully!");

            // Reload saved responses
            listSavedResponses();
        });
    }

    const resolveContact = (personWaId) => {
        if (contactProvidersData?.[personWaId] !== undefined) {
            // Already retrieved
            return;
        }

        resolveContactCall(personWaId, (response) => {
            setContactProvidersData(prevState => {
                prevState[personWaId] = response.data.contact_provider_results;
                return {...prevState};
            });
        });
    }

    const listContacts = () => {
        setLoadingNow('contacts');

        const callback = () => {
            setProgress(35);

            setLoadingNow('saved responses');

            // Trigger next request
            listSavedResponses();
        }

        // Check if needs to be loaded
        if (Object.keys(contactProvidersData).length !== 0) {
            callback();
            return;
        }

        listContactsCall(undefined, 0, undefined, (response) => {
            const preparedContactProvidersData = {};
            response.data.results.forEach((contact) => {
                const contactPhoneNumbers = contact.phone_numbers;

                const processedPhoneNumbers = [];
                contactPhoneNumbers.forEach((contactPhoneNumber) => {
                    const curPhoneNumber = preparePhoneNumber(contactPhoneNumber.phone_number);

                    // Prevent duplicates from same provider with same phone numbers formatted differently
                    if (processedPhoneNumbers.includes(curPhoneNumber)) {
                        return;
                    }

                    if (!(curPhoneNumber in preparedContactProvidersData)) {
                        preparedContactProvidersData[curPhoneNumber] = [];
                    }

                    preparedContactProvidersData[curPhoneNumber].push(contact);

                    processedPhoneNumbers.push(curPhoneNumber);
                });
            });

            setContactProvidersData(preparedContactProvidersData);

            // Chain
            callback();
        }, (error) => {
            if (error?.response?.status === 500) {
                // Continue with chain, in case contact provider data can not be loaded
                callback();
            }
        });
    }

    const listTags = () => {
        listTagsCall((response) => {
            setTags(response.data.results);
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
                    newMessages={newMessages}
                    setNewMessages={setNewMessages}
                    filterTag={filterTag}
                    setFilterTag={setFilterTag}
                    currentUser={currentUser}
                    setProgress={setProgress}
                    displayNotification={displayNotification}
                    isBlurred={isBlurred}
                    contactProvidersData={contactProvidersData}
                    retrieveContactData={resolveContact}
                    isChatOnly={isChatOnly}
                    setChatTagsListVisible={setChatTagsListVisible}
                    isSelectionModeEnabled={isSelectionModeEnabled}
                    setSelectionModeEnabled={setSelectionModeEnabled}
                    bulkSendPayload={bulkSendPayload}
                    selectedChats={selectedChats}
                    setSelectedChats={setSelectedChats}
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                    finishBulkSendMessage={finishBulkSendMessage}
                    tags={tags}
                    setLoadingNow={setLoadingNow} />
                }

                {templatesReady &&
                <Chat
                    isAdmin={isAdmin}
                    newMessages={newMessages}
                    setChosenContact={setChosenContact}
                    previewMedia={(chatMessage) => previewMedia(chatMessage)}
                    templates={templates}
                    isLoadingTemplates={isLoadingTemplates}
                    savedResponses={savedResponses}
                    createSavedResponse={createSavedResponse}
                    deleteSavedResponse={deleteSavedResponse}
                    contactProvidersData={contactProvidersData}
                    retrieveContactData={resolveContact}
                    isChatOnly={isChatOnly}
                    setChatAssignmentVisible={setChatAssignmentVisible}
                    setChatTagsVisible={setChatTagsVisible}
                    setSelectionModeEnabled={setSelectionModeEnabled}
                    setBulkSendPayload={setBulkSendPayload} />
                }

                {isSearchMessagesVisible &&
                <SearchMessage />
                }

                {isContactDetailsVisible &&
                <ContactDetails
                    contactData={chosenContact}
                    contactProvidersData={contactProvidersData}
                    retrieveContactData={resolveContact}
                    chats={chats}
                    filterTag={filterTag}
                    setFilterTag={setFilterTag}
                    users={users} />
                }

                {isChatAssignmentVisible &&
                <ChatAssignment
                    waId={waId}
                    open={isChatAssignmentVisible}
                    setOpen={setChatAssignmentVisible}
                    chats={chats}
                    setChats={setChats}
                    users={users}
                    currentUser={currentUser}
                    isAdmin={isAdmin} />
                }

                {isChatTagsVisible &&
                <ChatTags
                    waId={waId}
                    open={isChatTagsVisible}
                    setOpen={setChatTagsVisible}
                    chats={chats}
                    setChats={setChats}
                />
                }

                {isChatTagsListVisible &&
                <ChatTagsList
                    waId={waId}
                    open={isChatTagsListVisible}
                    setOpen={setChatTagsListVisible}
                    tags={tags}
                    filterTag={filterTag}
                    setFilterTag={setFilterTag}
                />
                }

                {chatMessageToPreview &&
                <PreviewMedia
                    data={chatMessageToPreview}
                    hideImageOrVideoPreview={hideImageOrVideoPreview} />
                }

                {isDownloadUnsupportedFileVisible &&
                <DownloadUnsupportedFile
                    open={isDownloadUnsupportedFileVisible}
                    setOpen={setDownloadUnsupportedFileVisible}
                    data={unsupportedFile} />
                }

                <Fade in={progress < 100} timeout={{exit: 1000}}>
                    <div className="loadingScreenOuter">
                        <LoadingScreen
                            progress={progress}
                            setProgress={setProgress}
                            loadingNow={loadingNow} />
                    </div>
                </Fade>

                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={isSuccessVisible} autoHideDuration={6000} onClose={handleSuccessClose}>
                    <Alert onClose={handleSuccessClose} severity="success" elevation={4}>
                        {successMessage}
                    </Alert>
                </Snackbar>

                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "left" }} open={isErrorVisible} autoHideDuration={6000} onClose={handleErrorClose}>
                    <Alert onClose={handleErrorClose} severity="error" elevation={4}>
                        {errorMessage}
                    </Alert>
                </Snackbar>

            </div>
        </Fade>
    )
}

export default Main;