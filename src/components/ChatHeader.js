import React, {useEffect, useRef, useState} from 'react';
import '../styles/ChatHeader.css';
import {Avatar, IconButton, Menu, MenuItem} from "@material-ui/core";
import {ArrowBack, MoreVert, Search} from "@material-ui/icons";
import {avatarStyles} from "../AvatarStyles";
import {BASE_URL, EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY} from "../Constants";
import PubSub from "pubsub-js";
import {useHistory} from "react-router-dom";
import axios from "axios";
import {getConfig} from "../Helpers";

function ChatHeader(props) {

    const [anchorEl, setAnchorEl] = useState(null);
    const [contactProviderResults, setContactProviderResults] = useState([]);
    const history = useHistory();

    const cancelTokenSourceRef = useRef();

    useEffect(() => {
        cancelTokenSourceRef.current = axios.CancelToken.source();

        if (props.contact !== undefined) {
            getContactDetails();
        }

        return () => {
            cancelTokenSourceRef.current.cancel();
        }
    }, [props.contact]);

    const displayMenu = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const hideMenu = () => {
        setAnchorEl(null);
    }

    const avatarClasses = avatarStyles();

    const showSearchMessages = () => {
        PubSub.publish(EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY, true);
    }

    const showContactDetails = () => {
        PubSub.publish(EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, true);
    }

    const showContactDetailsAndHideMenu = () => {
        showContactDetails();
        hideMenu();
    }

    const closeChat = () => {
        history.push("/main");
    }

    const getContactDetails = () => {
        axios.get( `${BASE_URL}contacts/${props.contact?.waId}`, getConfig(undefined, cancelTokenSourceRef.current.token))
            .then((response) => {
                console.log("Contact: ", response.data);

                setContactProviderResults(response.data.contact_provider_results);
            })
            .catch((error) => {
                //console.error(error);
            });
    }

    return (
        <div className="chat__header" onDrop={(event) => event.preventDefault()}>

            <div className="mobileOnly">
                <IconButton className="chat__header__backButton" onClick={closeChat}>
                    <ArrowBack />
                </IconButton>
            </div>

            <Avatar
                src={contactProviderResults?.[0]?.avatar}
                className={(props.contact?.isExpired ? '' : avatarClasses[props.contact?.getAvatarClassName()]) + (" chat__header__avatar")}
                onClick={showContactDetails}>{props.contact?.initials}</Avatar>

            <div className="chat__headerInfo">
                <h3>{contactProviderResults?.[0]?.name ?? props.contact?.name}</h3>

                {/*<p><Moment date={contact?.lastMessageTimestamp} format={dateFormat} unix /></p>*/}

                {props.contact?.isExpired &&
                <p className="chat__header__expired">Expired</p>
                }
            </div>

            <div className="chat__headerInfo_2">
                <span className="chat__headerInfo_2__waId desktopOnly">
                    {props.contact?.waId ? '+' + props.contact?.waId : ''}
                </span>
            </div>

            <div className="chat__headerRight">
                <IconButton onClick={showSearchMessages}>
                    <Search />
                </IconButton>
                <IconButton onClick={displayMenu}>
                    <MoreVert />
                </IconButton>
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
                <MenuItem onClick={showContactDetailsAndHideMenu}>Contact details</MenuItem>
            </Menu>

        </div>
    )
}

export default ChatHeader;