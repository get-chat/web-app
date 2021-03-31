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

                        {(props.data.phoneNumbers && props.data.phoneNumbers.length > 0) &&
                        <div className="contact__info__phoneNumber">
                            {props.data.phoneNumbers[0].phone_number}
                        </div>
                        }

                        {(props.data.phoneNumbers && props.data.phoneNumbers.length > 1) &&
                        <div className="contact__info__otherPhoneNumbers">
                            <span>{props.data.phoneNumbers?.length - 1} more phone numbers</span>
                        </div>
                        }
                    </div>
                </div>
            </ListItem>
        </div>
    )
}

export default Contact;