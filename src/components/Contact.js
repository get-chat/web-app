import React from "react";
import '../styles/Contact.css';
import {Avatar, ListItem} from "@material-ui/core";
import ContactProviderHeader from "./ContactProviderHeader";

function Contact(props) {
    return (
        <div className="contactWrapper">
            <ListItem button>
                <div className="contact">
                    <div className="contact__avatarWrapper">
                        <Avatar src={props.data.avatar}>{props.data.initials}</Avatar>
                        <ContactProviderHeader type={props.data.contactProvider} />
                    </div>
                    <div className="contact__info">
                        <h2>{props.data.name}</h2>

                        <div className="contact__info__details">
                            <span>{props.data.phoneNumbers?.length} phone number(s)</span>
                        </div>
                    </div>
                </div>
            </ListItem>
        </div>
    )
}

export default Contact;