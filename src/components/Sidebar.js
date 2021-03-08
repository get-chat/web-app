import React, {useEffect, useState} from 'react';
import '../styles/Sidebar.css';
import {Avatar, Divider, IconButton, Menu, MenuItem} from "@material-ui/core";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SidebarChat from "./SidebarChat";
import axios from "axios";
import {clearToken, getConfig, getObjLength} from "../Helpers";
import {BASE_URL, EVENT_TOPIC_MARKED_AS_SEEN, EVENT_TOPIC_NEW_CHAT_MESSAGES} from "../Constants";
import {useHistory, useParams} from "react-router-dom";
import SearchBar from "./SearchBar";
import SidebarContactResult from "./SidebarContactResult";
import ChatClass from "../ChatClass";
import UnseenMessageClass from "../UnseenMessageClass";
import PubSub from "pubsub-js";

function Sidebar(props) {

    const {waId} = useParams();

    const history = useHistory();

    const [chats, setChats] = useState({});
    const [unseenMessages, setUnseenMessages] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [contactResults, setContactResults] = useState({});

    const clearUserSession = () => {
        clearToken();
        history.push("/");
    }

    const logOut = () => {
        clearUserSession();
        hideMenu();
    }

    const displayMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const hideMenu = () => {
        setAnchorEl(null);
    };

    let cancelToken;

    useEffect(() => {
        // Generate a token
        cancelToken = axios.CancelToken.source();

        getChats(cancelToken, true);

        return () => {
            if (cancelToken !== undefined) {
                cancelToken.cancel("Operation canceled due to new request.");
            }
        }
    }, [keyword]);

    useEffect(() => {
        const onMarkedAsSeen = function (msg, data) {
            const relatedWaId = data;

            setUnseenMessages(prevState => {
                const nextState = prevState;
                delete nextState[relatedWaId];

                return {...nextState};
            });
        }

        const markedAsSeenEventToken = PubSub.subscribe(EVENT_TOPIC_MARKED_AS_SEEN, onMarkedAsSeen);

        return () => {
            PubSub.unsubscribe(markedAsSeenEventToken);
        }
    }, [unseenMessages]);

    useEffect(() => {
        // New messages
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

                    // Chats are ordered by incoming message date
                    if (!chatMessage.isFromUs) {
                        if (!nextState.hasOwnProperty(chatMessageWaId)) {
                            willMakeRequest = true;

                            // Create a chat here
                            //nextState[chatMessageWaId] = new ChatClass({});
                        } else {
                            changedAny = true;

                            // Update existing chat
                            nextState[chatMessageWaId].setLastMessage(chatMessage.payload);
                        }

                        // Unseen
                        if (waId !== chatMessageWaId) {
                            const preparedUnseenMessages = unseenMessages;
                            if (unseenMessages[chatMessageWaId] === undefined) {
                                preparedUnseenMessages[chatMessageWaId] = new UnseenMessageClass(chatMessageWaId, 0);
                            }

                            // Increase number of unseen messages
                            preparedUnseenMessages[chatMessageWaId].unseenMessages++;

                            setUnseenMessages({...preparedUnseenMessages});

                            // Display a notification
                            props.showNotification("New messages", "You have new messages!");
                        }
                    }
                });

                if (changedAny) {
                    // Sorting
                    let sortedNextState = Object.entries(nextState).sort((a, b) => b[1].lastMessageTimestamp - a[1].lastMessageTimestamp);
                    sortedNextState = Object.fromEntries(sortedNextState);

                    setChats({...sortedNextState});
                }

                // We do this to generate new (missing) chat
                if (willMakeRequest) {
                    getChats(cancelToken, false);
                }
            }
        }

        const newChatMessagesEventToken = PubSub.subscribe(EVENT_TOPIC_NEW_CHAT_MESSAGES, onNewMessages);

        return () => {
            PubSub.unsubscribe(newChatMessagesEventToken);
        }
    }, [waId, chats, unseenMessages, keyword]);

    const search = async (_keyword) => {
        setKeyword(_keyword);
    }

    const getChats = (cancelToken, isInitial) => {
        axios.get(`${BASE_URL}chats/`,
            getConfig({
                search: keyword
            }, cancelToken.token)
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

                const preparedUnseenMessages = {};
                response.data.results.forEach((unseenMessage) => {
                    const unseenWaId = unseenMessage.contact.waba_payload.wa_id;
                    const unseenAmount = unseenMessage.unseen_messages;
                    const prepared = new UnseenMessageClass(unseenWaId, unseenAmount);
                    preparedUnseenMessages[prepared.waId] = prepared;
                });

                if (willNotify) {
                    let hasAnyNewMessages = false;
                    setUnseenMessages((prevState => {
                            Object.entries(preparedUnseenMessages).forEach((unseen) => {
                                const unseenWaId = unseen[0]
                                const number = unseen[1].unseenMessages;
                                if (unseenWaId !== waId) {
                                    // TODO: Consider a new contact (last part of the condition)
                                    if ((prevState[unseenWaId] && number > prevState[unseenWaId].unseenMessages) /*|| (!prevState[unseenWaId] && number > 0)*/) {
                                        hasAnyNewMessages = true;
                                    }
                                }
                            });

                            // When state is a JSON object, it is unable to understand whether it is different or same and renders again
                            // So we check if new state is actually different than previous state
                            if (JSON.stringify(preparedUnseenMessages) !== JSON.stringify(prevState)) {
                                return preparedUnseenMessages;
                            } else {
                                return prevState;
                            }
                        }
                    ));

                    // Display a notification
                    if (hasAnyNewMessages) {
                        props.showNotification("New messages", "You have new messages!");
                    }
                } else {
                    setUnseenMessages(preparedUnseenMessages);
                }

            })
            .catch((error) => {
                console.log(error);

                // TODO: Move this to a common interceptor
                if (error.response) {
                    if (error.response.status === 401) {
                        // Invalid token
                        clearUserSession();
                    }
                }
            });
    }

    const displayBusinessProfile = () => {
        setAnchorEl(null);
        props.setBusinessProfileVisible(true);
    }

    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <Avatar>
                    {props.currentUser ? props.currentUser.username[0].toUpperCase() : ''}
                </Avatar>
                <div className="sidebar__headerRight">
                    <IconButton>
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
                            unseenMessages={unseenMessages}
                            keyword={keyword}
                        />
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
            </div>

            <Menu
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={hideMenu}
                elevation={3}>
                <MenuItem>Edit profile</MenuItem>
                <MenuItem onClick={displayBusinessProfile}>Business profile</MenuItem>
                <Divider />
                <MenuItem onClick={logOut}>Logout</MenuItem>
            </Menu>

        </div>
    )
}

export default Sidebar