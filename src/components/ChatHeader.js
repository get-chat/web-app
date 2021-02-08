import React from 'react';
import {Avatar, IconButton} from "@material-ui/core";
import {MoreVert, Search} from "@material-ui/icons";
import {avatarStyles} from "../AvatarStyles";

function ChatHeader(props) {

    const avatarClasses = avatarStyles();

    return (
        <div className="chat__header">
            <Avatar className={props.contact?.isExpired ? '' : avatarClasses[props.contact?.getAvatarClassName()]}>{props.contact?.initials}</Avatar>

            <div className="chat__headerInfo">
                <h3>{props.contact?.name}</h3>

                {/*<p><Moment date={contact?.lastMessageTimestamp} format={dateFormat} unix /></p>*/}

                {props.contact?.isExpired &&
                <p className="chat__header__expired">Expired</p>
                }
            </div>

            <div className="chat__headerRight">
                <IconButton>
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