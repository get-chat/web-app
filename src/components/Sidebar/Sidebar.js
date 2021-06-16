import React, {useEffect, useRef, useState} from 'react';
import '../../styles/Sidebar.css';
import {Avatar, Button, Divider, IconButton, Link, Menu, MenuItem, Tab, Tabs} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SidebarChat from "./SidebarChat";
import axios from "axios";
import {
    containsLetters,
    generateInitialsHelper,
    getConfig,
    getHubURL,
    getObjLength,
    isScrollable
} from "../../Helpers/Helpers";
import {
    BASE_URL,
    EVENT_TOPIC_GO_TO_MSG_ID,
    EVENT_TOPIC_NEW_CHAT_MESSAGES,
    EVENT_TOPIC_UPDATE_PERSON_NAME
} from "../../Constants";
import {useHistory, useParams} from "react-router-dom";
import SearchBar from "../SearchBar";
import SidebarContactResult from "../SidebarContactResult";
import ChatClass from "../../ChatClass";
import NewMessageClass from "../../NewMessageClass";
import PubSub from "pubsub-js";
import {avatarStyles} from "../../AvatarStyles";
import BusinessProfile from "./BusinessProfile";
import ChangePasswordDialog from "./ChangePasswordDialog";
import ChatMessageClass from "../../ChatMessageClass";
import SearchMessageResult from "../SearchMessageResult";
import {isMobile} from 'react-device-detect';
import ChatIcon from '@material-ui/icons/Chat';
import Contacts from "../Contacts";
import {clearContactProvidersData} from "../../Helpers/StorageHelper";
import CloseIcon from "@material-ui/icons/Close";
import {filterChat} from "../../Helpers/SidebarHelper";
import BulkSendIndicator from "./BulkSendIndicator";
import SelectableChatTag from "../SelectableChatTag";

function Sidebar(props) {

    const {waId} = useParams();
    const chatsContainer = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [chatMessages, setChatMessages] = useState({});
    const [contactResults, setContactResults] = useState({});
    const [isProfileVisible, setProfileVisible] = useState(false);
    const [isContactsVisible, setContactsVisible] = useState(false);
    const [isChangePasswordDialogVisible, setChangePasswordDialogVisible] = useState(false);
    const [tabCase, setTabCase] = useState("all")

    const [isBulkSendIndicatorVisible, setBulkSendIndicatorVisible] = useState(false);

    const history = useHistory();

    const avatarClasses = avatarStyles();

    const logOut = () => {
        props.clearUserSession();
        hideMenu();
    }

    const forceClearContactProvidersData = () => {
        clearContactProvidersData();
        window.location.reload();
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

        getChats(cancelTokenSourceRef.current, true, undefined, true);

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
        // New chatMessages
        const onNewMessages = function (msg, data) {
            // We don't need to update if chats are filtered
            if (keyword.trim().length === 0) {
                let willMakeRequest = false;

                const retrieveChatWaIdList = [];

                const nextState = props.chats;
                let changedAny = false;

                Object.entries(data).forEach((message) => {
                    //const msgId = message[0];
                    const chatMessage = message[1];
                    const chatMessageWaId = chatMessage.waId;

                    // New chat, incoming or outgoing message
                    // Check if chat with waId already exists
                    if (!nextState.hasOwnProperty(chatMessageWaId)) {
                        willMakeRequest = true;

                        // Collect waid list to retrieve chats
                        if (!retrieveChatWaIdList.includes(chatMessageWaId)) {
                            retrieveChatWaIdList.push(chatMessageWaId);
                        }
                    }

                    // Chats are ordered by incoming message date
                    if (nextState.hasOwnProperty(chatMessageWaId)) {
                        changedAny = true;

                        // Update existing chat
                        nextState[chatMessageWaId].setLastMessage(chatMessage.payload);

                        // Incoming
                        if (!chatMessage.isFromUs) {
                            // Update name and initials on incoming message if name is missing
                            const chat = nextState[chatMessageWaId];
                            if (chat) {
                                const chatName = chat.name;
                                if (!containsLetters(chatName)) {
                                    // Update sidebar chat name
                                    nextState[chatMessageWaId].setName(chatMessage.senderName);

                                    // Check if current chat
                                    if (waId === chatMessageWaId) {
                                        PubSub.publish(EVENT_TOPIC_UPDATE_PERSON_NAME, chatMessage.senderName);
                                    }
                                }
                            }
                        }
                    }

                    // New chatMessages
                    if (!chatMessage.isFromUs && (waId !== chatMessageWaId || document.visibilityState === 'hidden')) {
                        const preparedNewMessages = props.newMessages;
                        if (props.newMessages[chatMessageWaId] === undefined) {
                            preparedNewMessages[chatMessageWaId] = new NewMessageClass(chatMessageWaId, 0);
                        }

                        // Increase number of new chatMessages
                        preparedNewMessages[chatMessageWaId].newMessages++;

                        props.setNewMessages({...preparedNewMessages});

                        // Display a notification
                        if (!chatMessage.isFromUs) {
                            props.displayNotification("New messages", "You have new messages!", chatMessageWaId);
                        }
                    }
                });

                // If anything has changed, sort chats
                if (changedAny) {
                    // Sorting
                    const sortedNextState = sortChats(nextState);
                    props.setChats({...sortedNextState});
                }

                // We do this to generate new (missing) chat
                if (willMakeRequest) {
                    retrieveChatWaIdList.forEach((chatMessageWaId) => {
                        retrieveChat(chatMessageWaId);
                    })

                    //getChats(cancelTokenSourceRef.current, false, undefined, false);
                }
            }
        }

        const newChatMessagesEventToken = PubSub.subscribe(EVENT_TOPIC_NEW_CHAT_MESSAGES, onNewMessages);

        return () => {
            PubSub.unsubscribe(newChatMessagesEventToken);
        }
    }, [waId, props.chats, props.newMessages, keyword]);

    useEffect(() => {
        const chatsContainerCopy = chatsContainer.current;

        // To optimize scroll event
        let debounceTimer;

        function handleScroll(e) {
            if (debounceTimer) {
                window.clearTimeout(debounceTimer);
            }

            if (keyword) {
                window.clearTimeout(debounceTimer);
                return false;
            }

            debounceTimer = setTimeout(function () {
                // const threshold = 0;
                const el = e.target;

                if (isScrollable(el)) {
                    if (el.scrollHeight - el.scrollTop - el.clientHeight < 1) {
                        getChats(cancelTokenSourceRef.current, false, getObjLength(props.chats), false);
                    }
                }
            }, 100);
        }

        chatsContainerCopy.addEventListener("scroll", handleScroll);

        return () => {
            clearTimeout(debounceTimer);
            chatsContainerCopy.removeEventListener("scroll", handleScroll);
        }
    }, [props.chats, keyword]);

    const search = async (_keyword) => {
        setKeyword(_keyword);
    }

    const sortChats = (state) => {
        let sortedState = Object.entries(state).sort((a, b) => b[1].lastMessageTimestamp - a[1].lastMessageTimestamp);
        return Object.fromEntries(sortedState);
    }

    const getChats = (cancelTokenSource, isInitial, offset, replaceAll) => {
        axios.get(`${BASE_URL}chats/`,
            getConfig({
                search: keyword,
                limit: 18,
                offset: offset
            }, cancelTokenSource.token)
        )
            .then((response) => {
                console.log("Chats", response.data)

                const preparedChats = {};
                response.data.results.forEach((contact) => {
                    const prepared = new ChatClass(contact);
                    preparedChats[prepared.waId] = prepared;
                });

                props.setChats(prevState => {
                    if (replaceAll) {
                        return preparedChats;
                    } else {
                        return {...prevState, ...preparedChats};
                    }
                });

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

                    props.setNewMessages(prevState => {
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
                                return {...prevState, ...preparedNewMessages};
                            } else {
                                return prevState;
                            }
                        }
                    );

                    // Display a notification
                    if (hasAnyNewMessages) {
                        props.displayNotification("New messages", "You have new messages!", chatMessageWaId);
                    }
                } else {
                    props.setNewMessages(prevState => {
                        return {...prevState, ...preparedNewMessages}
                    });
                }

            })
            .catch((error) => {
                console.log(error);

                if (error.response) {
                    handleIfUnauthorized(error);
                }
            });
    }

    const retrieveChat = (chatWaId) => {
        axios.get( `${BASE_URL}chats/${chatWaId}/`, getConfig())
            .then((response) => {
                console.log("Chat: ", response.data);

                const preparedChat = new ChatClass(response.data);

                props.setChats(prevState => {
                    prevState[chatWaId] = preparedChat;
                    const sortedNextState = sortChats(prevState);
                    return {...sortedNextState};
                });
            })
            .catch((error) => {
                window.displayError(error);

                if (error.response) {
                    handleIfUnauthorized(error);
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
            })
            .catch((error) => {
                console.log(error);

                if (error.response) {
                    handleIfUnauthorized(error);
                }
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

    const handleIfUnauthorized = (error) => {
        if (error.response.status === 401) {
            props.clearUserSession("invalidToken");
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

    const showChangePassword = () => {
        setAnchorEl(null);
        setChangePasswordDialogVisible(true);
    }

    const showChatTagsList = () => {
        setAnchorEl(null);
        props.setChatTagsListVisible(true);
    }

    const displayContacts = () => {
        setContactsVisible(true);
    }

    const handleTabChange = (event, newValue) => {
        setTabCase(newValue);
    }

    const clearFilter = () => {
        props.setFilterTag(undefined);
    }

    const cancelSelection = () => {
        props.setSelectionModeEnabled(false);
        props.setSelectedChats([]);
        props.setSelectedTags([]);
    }

    const finishBulkSendMessage = () => {
        props.setSelectionModeEnabled(false);
        props.finishBulkSendMessage();
    }

    return (
        <div className={"sidebar" + (props.isChatOnly ? " hidden" : "")}>
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

            {props.filterTag &&
            <div className="sidebar__clearFilter" onClick={clearFilter}>
                <CloseIcon />
                Clear filter:&nbsp;
                <span className="bold">{props.filterTag.name}</span>
            </div>
            }

            <div className="sidebar__tabs">
                <Tabs
                    textColor="primary"
                    indicatorColor="primary"
                    variant={"fullWidth"}
                    value={tabCase}
                    scrollButtons="auto"
                    onChange={handleTabChange}>

                    <Tab label={"All"} value={"all"} />
                    <Tab label={"Me"} value={"me"} />
                    <Tab label={"Group"} value={"group"} />

                </Tabs>
            </div>

            <div
                className="sidebar__results"
                ref={chatsContainer}>

                {props.isSelectionModeEnabled &&
                <div className="sidebar__results__selectionActions">
                    <Button color="secondary" onClick={cancelSelection}>Cancel</Button>
                    <Button color="primary" onClick={finishBulkSendMessage}>Send</Button>
                </div>
                }

                {(props.isSelectionModeEnabled && props.tags) &&
                <h3>Tags</h3>
                }

                {(props.isSelectionModeEnabled && props.tags) &&
                <div>
                    { Object.entries(props.tags).map((tag) =>
                        <SelectableChatTag key={tag[0]} data={tag[1]} />
                    )}
                </div>
                }

                {keyword.trim().length > 0 &&
                <h3>Chats</h3>
                }

                <div className="sidebar__results__chats">
                    { Object.entries(props.chats)
                        .filter((chat) => {
                            // Filter by helper method
                            return filterChat(props, tabCase, chat[1]);
                        })
                        .map((chat) =>
                            <SidebarChat
                                key={chat[0]}
                                chatData={chat[1]}
                                newMessages={props.newMessages}
                                keyword={keyword}
                                contactProvidersData={props.contactProvidersData}
                                retrieveContactData={props.retrieveContactData}
                                tabCase={tabCase}
                                isSelectionModeEnabled={props.isSelectionModeEnabled}
                                setSelectedChats={props.setSelectedChats} />
                        )}

                    { Object.keys(props.chats).length === 0 &&
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
                contactProvidersData={props.contactProvidersData}
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

            {isBulkSendIndicatorVisible &&
            <BulkSendIndicator/>
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
                <MenuItem onClick={showChatTagsList}>Tags</MenuItem>
                <Divider />
                <MenuItem className="sidebar__menu__refresh" onClick={() => window.location.reload()}>Refresh</MenuItem>
                <MenuItem onClick={showChangePassword}>Change password</MenuItem>
                <MenuItem onClick={forceClearContactProvidersData}>Refresh contacts</MenuItem>
                {props.isAdmin &&
                <Divider />
                }
                {props.isAdmin &&
                <MenuItem component={Link} href={getHubURL()} target="_blank" color="initial">Admin panel</MenuItem>
                }
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