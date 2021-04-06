import React from "react";
import '../styles/Contact.css';
import {Avatar, ListItem} from "@material-ui/core";
import {avatarStyles} from "../AvatarStyles";

function Person(props) {

    const avatarClasses = avatarStyles();

    const handleClick = () => {
        goToChat(props.data.waId);
    }

    const goToChat = (waId) => {
        props.verifyPhoneNumber(props.data, waId);
    }

    return (
        <div className="contactWrapper">
            <ListItem button>
                <div className="contact" onClick={handleClick}>
                    <div className="contact__avatarWrapper">
                        <Avatar
                            src={props.contactProvidersData[props.data.waId]?.[0]?.avatar}
                            className={avatarClasses[props.data.getAvatarClassName()]}>
                            {props.data.initials}
                        </Avatar>
                    </div>
                    <div className="contact__info">
                        <h2>{props.contactProvidersData[props.data.waId]?.[0]?.name ?? props.data.name}</h2>

                        <div className="contact__info__phoneNumber">
                            {props.data.waId}
                        </div>
                    </div>
                </div>
            </ListItem>
        </div>
    )
}

export default Person;