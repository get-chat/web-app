import React from 'react';
import {Avatar, IconButton} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import PubSub from "pubsub-js";
import {EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY} from "../Constants";
import '../styles/ContactDetails.css';
import Moment from "react-moment";

// TODO: Provide a better date format depends on date
const dateFormat = 'dddd, H:mm';

function ContactDetails(props)  {

    const data = props.contactData;

    const hideContactDetails = () => {
        PubSub.publish(EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, false);
    }

    return (
        <div className="contactDetails">
            <div className="contactDetails__header">
                <IconButton onClick={hideContactDetails}>
                    <CloseIcon />
                </IconButton>

                <h3>Contact Details</h3>
            </div>

            {data &&
            <div className="contactDetails__body">

                <div className="contactDetails__body__section">
                    <div className="contactDetails__body__avatarContainer">
                        <Avatar className="contactDetails__body__avatar">{data.initials}</Avatar>
                    </div>

                    <h3>{data.name}</h3>
                    <span>Last message: <Moment unix format={dateFormat}>{data.lastMessageTimestamp}</Moment></span>
                </div>

                <div className="contactDetails__body__section">
                    <span>{'+' + data.waId}</span>
                </div>

            </div>
            }
        </div>
    )
}

export default ContactDetails;