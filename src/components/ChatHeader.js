import React from 'react';
import {Avatar, IconButton} from "@material-ui/core";
import {ArrowBack, MoreVert, Search} from "@material-ui/icons";
import {avatarStyles} from "../AvatarStyles";
import {EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY} from "../Constants";
import PubSub from "pubsub-js";
import {useHistory} from "react-router-dom";

function ChatHeader(props) {

    const history = useHistory();

    const avatarClasses = avatarStyles();

    const showSearchMessages = () => {
        PubSub.publish(EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY, true);
    }

    const showContactDetails = () => {
        PubSub.publish(EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, true);
    }

    const closeChat = () => {
        history.push("/main");
    }

    return (
        <div className="chat__header" onDrop={(event) => event.preventDefault()}>

            <div className="mobileOnly">
                <IconButton className="chat__header__backButton" onClick={closeChat}>
                    <ArrowBack />
                </IconButton>
            </div>

            <Avatar className={(props.contact?.isExpired ? '' : avatarClasses[props.contact?.getAvatarClassName()]) + (" chat__header__avatar")} onClick={showContactDetails}>{props.contact?.initials}</Avatar>

            <div className="chat__headerInfo">
                <h3>{props.contact?.name}</h3>

                {/*<p><Moment date={contact?.lastMessageTimestamp} format={dateFormat} unix /></p>*/}

                {props.contact?.isExpired &&
                <p className="chat__header__expired">Expired</p>
                }
            </div>

            <div className="chat__headerInfo_2">
                <span className="chat__headerInfo_2__waId">
                    {props.contact?.waId ? '+' + props.contact?.waId : ''}
                </span>
            </div>

            <div className="chat__headerRight">
                <IconButton onClick={showSearchMessages}>
                    <Search />
                </IconButton>
                <IconButton>
                    <MoreVert />
                </IconButton>
            </div>
        </div>
    )
}

export default ChatHeader;