import React from 'react';
import '../styles/SidebarChat.css';
import {Avatar} from "@material-ui/core";
import {Link, useParams} from "react-router-dom";
import Moment from "react-moment";
import {avatarStyles} from "../AvatarStyles";

function SidebarChat(props) {

    const {waId} = useParams();

    const dateFormat = 'H:mm';

    const avatarClasses = avatarStyles();

    return (
        <Link to={ `/main/chat/${props.chatData.waId}` }>
            <div id={props.chatData.waId} className={'sidebarChat ' + (waId === props.chatData.waId ? 'activeChat' : '')}>
                <Avatar className={props.chatData.isExpired ? '' : avatarClasses[props.chatData.initials]}>{props.chatData.initials}</Avatar>
                <div className="sidebarChat__info">
                    <h2>{props.chatData.name}</h2>
                    <p className="sidebarChat__info__lastMessage">
                        {((props.unseenMessages[props.chatData.waId]?.unseenMessages ?? 0) > 0 /*&& waId !== props.chatData.waId*/)
                            ?
                            <span className="sidebarChat__info__lastMessage__new">
                                {props.unseenMessages[props.chatData.waId]?.unseenMessages} new message(s)
                            </span>
                            :
                            <Moment date={props.chatData.lastMessageTimestamp} format={dateFormat} unix />
                        }
                    </p>
                    {props.chatData.isExpired &&
                    <p className="sidebarChat__info__expired">Expired</p>
                    }
                </div>
            </div>
        </Link>
    )
}

export default SidebarChat