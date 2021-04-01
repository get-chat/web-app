import React, {useEffect, useRef, useState} from 'react';
import '../styles/Sidebar.css';
import {Avatar, Divider, IconButton, Menu, MenuItem} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SidebarChat from "./SidebarChat";
import axios from "axios";
import {generateInitialsHelper, getConfig, getObjLength} from "../Helpers";
import {
    BASE_URL,
    EVENT_TOPIC_GO_TO_MSG_ID,
    EVENT_TOPIC_MARKED_AS_RECEIVED,
    EVENT_TOPIC_NEW_CHAT_MESSAGES
} from "../Constants";
import {useHistory, useParams} from "react-router-dom";
import SearchBar from "./SearchBar";
import SidebarContactResult from "./SidebarContactResult";
import ChatClass from "../ChatClass";
import NewMessageClass from "../NewMessageClass";
import PubSub from "pubsub-js";
import {avatarStyles} from "../AvatarStyles";
import BusinessProfile from "./BusinessProfile";
import ChangePasswordDialog from "./ChangePasswordDialog";
import ChatMessageClass from "../ChatMessageClass";
import SearchMessageResult from "./SearchMessageResult";
import {isMobile} from 'react-device-detect';
import ChatIcon from '@material-ui/icons/Chat';
import Contacts from "./Contacts";

function Sidebar(props) {

    const {waId} = useParams();

    const [chats, setChats] = useState({});
    const [newMessages, setNewMessages] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [chatMessages, setChatMessages] = useState({});
    const [contactResults, setContactResults] = useState({});
    const [isProfileVisible, setProfileVisible] = useState(false);
    const [isContactsVisible, setContactsVisible] = useState(false);
    const [isChangePasswordDialogVisible, setChangePasswordDialogVisible] = useState(false);

    const history = useHistory();

    const avatarClasses = avatarStyles();

    const logOut = () => {
        props.clearUserSession();
        hideMenu();
    }

    const displayMenu = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const hideMenu = () => {
        setAnchorEl(null);
    }

    let cancelTokenSourceRef = useRef();

    useEffect(() => {
        // Generate a token
        cancelTokenSourceRef.current = axios.CancelToken.source();

        getChats(cancelTokenSourceRef.current, true);

        if (keyword.trim().length > 0) {
            searchMessages(cancelTokenSourceRef.current);
        }

        return () => {
            if (cancelTokenSourceRef.current) {
                cancelTokenSourceRef.current.cancel("Operation canceled due to new request.");
            }
        }
    }, [keyword]);

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
        // New chatMessages
        const onNewMessages = function (msg, data) {
            // We don't need to update if chats are filtered
            if (keyword.trim().length === 0) {
                let willMakeRequest = false;

                const nextState = chats;
                let changedAny = false;

                Object.entries(data).forEach((message) => {
                    //const msgId = message[0];
                    const chatMessage = message[1];
                    const chatMessageWaId = chatMessage.waId;

                    // New chat, incoming or outgoing message
                    // Check if chat with waId already exists
                    if (!nextState.hasOwnProperty(chatMessageWaId)) {
                        willMakeRequest = true;
                    }

                    // Chats are ordered by incoming message date
                    if (!chatMessage.isFromUs) {
                        if (nextState.hasOwnProperty(chatMessageWaId)) {
                            changedAny = true;

                            // Update existing chat
                            nextState[chatMessageWaId].setLastMessage(chatMessage.payload);
                        }

                        // New chatMessages
                        if (waId !== chatMessageWaId) {
                            const preparedNewMessages = newMessages;
                            if (newMessages[chatMessageWaId] === undefined) {
                                preparedNewMessages[chatMessageWaId] = new NewMessageClass(chatMessageWaId, 0);
                            }

                            // Increase number of new chatMessages
                            preparedNewMessages[chatMessageWaId].newMessages++;

                            setNewMessages({...preparedNewMessages});

                            // Display a notification
                            props.showNotification("New messages", "You have new messages!", chatMessageWaId);
                        }
                    }
                });

                // If anything has changed, sort chats
                if (changedAny) {
                    // Sorting
                    let sortedNextState = Object.entries(nextState).sort((a, b) => b[1].lastMessageTimestamp - a[1].lastMessageTimestamp);
                    sortedNextState = Object.fromEntries(sortedNextState);

                    setChats({...sortedNextState});
                }

                // We do this to generate new (missing) chat
                if (willMakeRequest) {
                    getChats(cancelTokenSourceRef.current, false);
                }
            }
        }

        const newChatMessagesEventToken = PubSub.subscribe(EVENT_TOPIC_NEW_CHAT_MESSAGES, onNewMessages);

        return () => {
            PubSub.unsubscribe(newChatMessagesEventToken);
        }
    }, [waId, chats, newMessages, keyword]);

    const search = async (_keyword) => {
        setKeyword(_keyword);
    }

    const getChats = (cancelTokenSource, isInitial) => {
        axios.get(`${BASE_URL}chats/`,
            getConfig({
                search: keyword
            }, cancelTokenSource.token)
        )
            .then((response) => {
                //console.log("Chats", response.data)

                const preparedChats = {};
                response.data.results.forEach((contact) => {
                    const prepared = new ChatClass(contact);
                    preparedChats[prepared.waId] = prepared;
                });

                setChats(preparedChats);

                // In case param is undefined
                isInitial = isInitial === true;

                if (isInitial) {
                    props.setProgress(100);
                }

                const willNotify = !isInitial;

                const preparedNewMessages = {};
                response.data.results.forEach((newMessage) => {
                    const newWaId = newMessage.contact.waba_payload.wa_id;
                    const newAmount = newMessage.new_messages;
                    const prepared = new NewMessageClass(newWaId, newAmount);
                    preparedNewMessages[prepared.waId] = prepared;
                });

                if (willNotify) {
                    let hasAnyNewMessages = false;
                    let chatMessageWaId;

                    setNewMessages((prevState => {
                            Object.entries(preparedNewMessages).forEach((newMsg) => {
                                const newMsgWaId = newMsg[0]
                                const number = newMsg[1].newMessages;
                                if (newMsgWaId !== waId) {
                                    // TODO: Consider a new contact (last part of the condition)
                                    if ((prevState[newMsgWaId] && number > prevState[newMsgWaId].newMessages) /*|| (!prevState[newMsgWaId] && number > 0)*/) {
                                        hasAnyNewMessages = true;

                                        // There can be multiple new chats, we take first one
                                        if (chatMessageWaId === newMsgWaId) chatMessageWaId = newMsgWaId;
                                    }
                                }
                            });

                            // When state is a JSON object, it is unable to understand whether it is different or same and renders again
                            // So we check if new state is actually different than previous state
                            if (JSON.stringify(preparedNewMessages) !== JSON.stringify(prevState)) {
                                return preparedNewMessages;
                            } else {
                                return prevState;
                            }
                        }
                    ));

                    // Display a notification
                    if (hasAnyNewMessages) {
                        props.showNotification("New messages", "You have new messages!", chatMessageWaId);
                    }
                } else {
                    setNewMessages(preparedNewMessages);
                }

            })
            .catch((error) => {
                console.log(error);

                // TODO: Move this to a common interceptor
                if (error.response) {
                    if (error.response.status === 401) {
                        // Invalid token
                        props.clearUserSession("invalidToken");
                    }
                }
            });
    }

    const searchMessages = (cancelTokenSource) => {
        axios.get( `${BASE_URL}messages/`,
            getConfig({
                //offset: offset ?? 0,
                limit: 30,
                search: keyword
            }, cancelTokenSource.token)
        )
            .then((response) => {
                console.log("Messages", response.data);

                const preparedMessages = {};
                response.data.results.forEach((message) => {
                    const prepared = new ChatMessageClass(message);
                    preparedMessages[prepared.id] = prepared;
                });

                setChatMessages(preparedMessages);

                console.log(preparedMessages);

            })
            .catch((error) => {
                //displayError(error);
            });
    }

    const goToMessage = (chatMessage) => {
        if (waId !== chatMessage.waId) {
            history.push({
                'pathname': `/main/chat/${chatMessage.waId}`,
                'goToMessage': chatMessage,
            });
        } else {
            PubSub.publish(EVENT_TOPIC_GO_TO_MSG_ID, chatMessage);
        }
    }

    const displayEditBusinessProfile = () => {
        setAnchorEl(null);
        props.setBusinessProfileVisible(true);
    }

    const goToSettings = () => {
        setAnchorEl(null);
        if (window.AndroidWebInterface) {
            window.AndroidWebInterface.goToSettings();
        }
    }

    const displayContacts = () => {
        setContactsVisible(true);
    }

    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <Avatar
                    onClick={() => setProfileVisible(true)}
                    className={"cursorPointer " + (props.currentUser ? avatarClasses[generateInitialsHelper(props.currentUser.username)?.[0]] : '')}>
                    {props.currentUser ? generateInitialsHelper(props.currentUser.username) : ''}
                </Avatar>
                <div className="sidebar__headerRight">
                    <IconButton onClick={displayContacts}>
                        <ChatIcon />
                    </IconButton>
                    <IconButton onClick={displayMenu}>
                        <MoreVertIcon />
                    </IconButton>
                </div>
            </div>

            <SearchBar onChange={(_keyword) => search(_keyword)} />

            <div className="sidebar__results">

                {keyword.trim().length > 0 &&
                <h3>Chats</h3>
                }

                <div className="sidebar__results__chats">
                    { Object.entries(chats).map((chat) =>
                        <SidebarChat
                            key={chat[0]}
                            chatData={chat[1]}
                            newMessages={newMessages}
                            keyword={keyword}
                            contactProvidersData={props.contactProvidersData}
                            retrieveContactData={props.retrieveContactData} />
                    )}

                    { Object.keys(chats).length === 0 &&
                    <span className="sidebar__results__chats__noResult">
                        {keyword.trim().length > 0 ?
                            <span>No chats found for: <span className="searchOccurrence">{keyword}</span></span>
                            :
                            <span>You don't have any chats yet.</span>
                        }
                    </span>
                    }
                </div>

                {(keyword.trim().length > 0 && getObjLength(contactResults) > 0) &&
                <h3>Contacts</h3>
                }

                {(keyword.trim().length > 0 && getObjLength(contactResults) > 0) &&
                <div className="sidebar__results__contacts">
                    { Object.entries(contactResults).map((contactResult) =>
                        <SidebarContactResult
                            key={contactResult[0]}
                            chatData={contactResult[1]}
                        />
                    )}
                </div>
                }

                {(keyword.trim().length > 0 && getObjLength(chatMessages) > 0) &&
                <h3>Messages</h3>
                }

                {(keyword.trim().length > 0 && getObjLength(chatMessages) > 0) &&
                <div className="sidebar__results__messages">
                    { Object.entries(chatMessages).map((message) =>
                        <SearchMessageResult
                            key={message[0]}
                            waId={waId}
                            messageData={message[1]}
                            keyword={keyword}
                            displaySender={true}
                            onClick={(chatMessage) => goToMessage(chatMessage)} />
                    )}
                </div>
                }
            </div>

            {isContactsVisible &&
            <Contacts
                onHide={() => setContactsVisible(false)} />
            }

            {isProfileVisible &&
            <BusinessProfile
                isAdmin={props.isAdmin}
                currentUser={props.currentUser}
                onHide={() => setProfileVisible(false)}
                displayEditBusinessProfile={displayEditBusinessProfile}
                setChangePasswordDialogVisible={setChangePasswordDialogVisible} />
            }

            <Menu
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={hideMenu}
                elevation={3}>
                <MenuItem className="sidebar__menu__refresh" onClick={() => window.location.reload()}>Refresh</MenuItem>
                <MenuItem onClick={() => setChangePasswordDialogVisible(true)}>Change password</MenuItem>
                {isMobile &&
                <MenuItem onClick={goToSettings}>Settings (App Only)</MenuItem>
                }
                <Divider />
                <MenuItem onClick={logOut}>Logout</MenuItem>
            </Menu>

            <ChangePasswordDialog
                open={isChangePasswordDialogVisible}
                setOpen={setChangePasswordDialogVisible} />

        </div>
    )
}

export default Sidebar