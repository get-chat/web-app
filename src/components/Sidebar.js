import React, {useEffect, useState} from 'react';
import '../styles/Sidebar.css';
import {Avatar, IconButton, Menu, MenuItem} from "@material-ui/core";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SidebarChat from "./SidebarChat";
import axios from "axios";
import {clearToken, getConfig, getObjLength} from "../Helpers";
import {BASE_URL} from "../Constants";
import {useHistory} from "react-router-dom";
import SearchBar from "./SearchBar";
import SidebarContactResult from "./SidebarContactResult";
import ChatClass from "../ChatClass";

function Sidebar(props) {

    const history = useHistory();

    const [chats, setChats] = useState({});
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

    useEffect(() => {
        // Generate a token
        const cancelToken = axios.CancelToken.source();

        getChats(cancelToken, true);

        const intervalId = setInterval(() => {
            getChats(cancelToken);
        }, 5000);

        return () => {
            if (cancelToken !== undefined) {
                cancelToken.cancel("Operation canceled due to new request.");
            }
            clearInterval(intervalId);
        }
    }, [keyword]);

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
                response.data.results.map((contact) => {
                    const prepared = new ChatClass(contact);
                    preparedChats[prepared.waId] = prepared;
                });

                setChats(preparedChats);

                if (isInitial) {
                    props.setProgress(100);
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

    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <Avatar>?</Avatar>
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
                            unseenMessages={props.unseenMessages}
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
                <MenuItem onClick={logOut}>Logout</MenuItem>
            </Menu>

        </div>
    )
}

export default Sidebar