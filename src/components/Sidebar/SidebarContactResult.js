import React from 'react';
import '../../styles/SidebarContactResult.css';
import {Link} from "react-router-dom";
import {Avatar} from "@material-ui/core";
import {avatarStyles} from "../../AvatarStyles";

function SidebarContactResult(props) {

    const data = props.contactData;
    const avatarClasses = avatarStyles();

    return (
        <Link>
            <div id={data.waId}>
                <Avatar className={props.chatData.isExpired ? '' : avatarClasses[props.chatData.getAvatarClassName()]}>{props.chatData.initials}</Avatar>
                <div className="sidebarContactResult__info">
                    <h2>{props.chatData.name}</h2>
                    <p className="sidebarContactResult__info__status">
                        Status
                    </p>
                </div>
            </div>
        </Link>
    )
}

export default SidebarContactResult;