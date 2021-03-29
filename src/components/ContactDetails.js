import React, {useEffect} from 'react';
import {Avatar, IconButton} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import PubSub from "pubsub-js";
import {CALENDAR_NORMAL, EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY} from "../Constants";
import '../styles/ContactDetails.css';
import Moment from "react-moment";
import {avatarStyles} from "../AvatarStyles";

function ContactDetails(props)  {

    const hideContactDetails = () => {
        PubSub.publish(EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, false);
    }

    const avatarClasses = avatarStyles();

    useEffect(() => {
        props.retrieveContactData(props.contactData.waId);
    }, []);

    return (
        <div className="contactDetails">
            <div className="contactDetails__header">
                <IconButton onClick={hideContactDetails}>
                    <CloseIcon />
                </IconButton>

                <h3>Contact Details</h3>
            </div>

            {props.contactData &&
            <div className="contactDetails__body">

                <div className="contactDetails__body__section">
                    <div className="contactDetails__body__avatarContainer">
                        <Avatar
                            src={props.contactProvidersData[props.contactData.waId]?.[0]?.avatar}
                            className={avatarClasses[props.contactData.getAvatarClassName()] + " contactDetails__body__avatar"}>{props.contactData.initials}</Avatar>
                    </div>

                    <h3>{props.contactProvidersData[props.contactData.waId]?.[0]?.name ?? props.contactData.name}</h3>
                    <span>Last message: <Moment unix calendar={CALENDAR_NORMAL}>{props.contactData.lastMessageTimestamp}</Moment></span>
                </div>

                <div className="contactDetails__body__section">
                    <span>{'+' + props.contactData.waId}</span>
                </div>

                {props.contactProvidersData[props.contactData.waId]?.map((providerData, index) =>
                    <div
                        className="contactDetails__body__section"
                        key={providerData.contact_provider.id}>

                        <div>
                            {providerData.contact_provider.name}
                            {providerData.contact_provider.type === "google" &&
                                <span>GOOGLE ICON</span>
                            }
                        </div>

                        <div>Phone number</div>
                        <div>
                            {providerData.phone_numbers?.map((phoneNumber, phoneNumberIndex) =>
                                <div key={phoneNumberIndex}>
                                    <span>+</span>
                                    <span>{phoneNumber.phone_number}</span>
                                    {phoneNumber.description !== undefined &&
                                        <span>{phoneNumber.description}</span>
                                    }
                                </div>
                            )}
                        </div>

                        {/*{JSON.stringify(providerData)}*/}
                    </div>
                )}

            </div>
            }
        </div>
    )
}

export default ContactDetails;