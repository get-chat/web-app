import React, {useEffect, useState} from 'react';
import '../styles/Sidebar.css';
import {Avatar, IconButton, Menu, MenuItem} from "@material-ui/core";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import {SearchOutlined} from "@material-ui/icons";
import SidebarChat from "./SidebarChat";
import axios from "axios";
import {clearToken, getConfig} from "../Helpers";
import {BASE_URL} from "../Constants";
import {useHistory} from "react-router-dom";
import ContactClass from "../ContactClass";

function Sidebar() {

    const history = useHistory();

    const[chats, setChats] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);

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
        axios.get(`${BASE_URL}contacts/`, getConfig())
            .then((response) => {
                console.log("Contacts", response.data)
                //setChats(response.data.results)

                const preparedChats = {};
                response.data.results.map((contact) => {
                    const prepared = new ContactClass(contact);
                    preparedChats[prepared.waId] = prepared;
                });

                setChats(preparedChats);

            })
            .catch((error) => {
                console.log(error);
                if (error.response) {
                    if (error.response.status === 401) {
                        // Invalid token
                        clearUserSession();
                    }
                }
            });
    }, []);

    return(
        <div className="sidebar">
            <div className="sidebar__header">
                <Avatar  src="https://avatars.dicebear.com/api/human/berk.svg" />
                <div className="sidebar__headerRight">
                    <IconButton>
                        <ChatIcon />
                    </IconButton>
                    <IconButton onClick={displayMenu}>
                        <MoreVertIcon />
                    </IconButton>
                </div>
            </div>

            <div className="sidebar__search">
                <div className="sidebar__searchContainer">
                    <SearchOutlined />
                    <input placeholder="Search" type="text" />
                </div>
            </div>

            <div className="sidebar__chats">
                { Object.entries(chats).map((chat) =>
                    <SidebarChat
                        key={chat[0]}
                        chatData={chat[1]}
                    />
                )}
            </div>

            <Menu
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={hideMenu}>
                <MenuItem onClick={logOut}>Logout</MenuItem>
            </Menu>

        </div>
    )
}

export default Sidebar