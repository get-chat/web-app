import React from 'react';
import {IconButton} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import PubSub from "pubsub-js";
import {EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY} from "../Constants";
import '../styles/ContactDetails.css';

function ContactDetails(props)  {

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

            <div className="contactDetails__body">



            </div>
        </div>
    )
}

export default ContactDetails;