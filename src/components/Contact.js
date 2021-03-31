import React from "react";
import '../styles/Contact.css';
import {Avatar, ListItem} from "@material-ui/core";

function Contact(props) {
    return (
        <div className="contactWrapper">
            <ListItem button>
                <div className="contact">
                    <Avatar src={props.data.avatar}>{props.data.initials}</Avatar>
                    <div className="contact__info">
                        <h2>{props.data.name}</h2>
                    </div>
                </div>
            </ListItem>
        </div>
    )
}

export default Contact;