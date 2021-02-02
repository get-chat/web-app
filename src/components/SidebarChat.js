import React from 'react';
import '../styles/SidebarChat.css';
import {Avatar} from "@material-ui/core";
import {Link} from "react-router-dom";
import Moment from "react-moment";
import {avatarStyles} from "../AvatarStyles";

function SidebarChat(props) {

    const dateFormat = 'H:mm';

    const avatarClasses = avatarStyles();

    return (
        <Link to={ `/main/chat/${props.chatData.waId}` }>
            <div id={props.chatData.waId} className="sidebarChat">
                <Avatar className={props.chatData.isExpired ? '' : avatarClasses[props.chatData.initials]}>{props.chatData.initials}</Avatar>
                <div className="sidebarChat__info">
                    <h2>{props.chatData.name}</h2>
                    <p className="sidebarChat__info__lastMessage"><Moment date={props.chatData.lastMessageTimestamp} format={dateFormat} unix /></p>
                    {props.chatData.isExpired &&
                    <p className="sidebarChat__info__expired">Expired</p>
                    }
                </div>
            </div>
        </Link>
    )
}

export default SidebarChat