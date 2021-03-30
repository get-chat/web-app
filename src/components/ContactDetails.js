import React, {useEffect} from 'react';
import {Avatar, IconButton} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import PubSub from "pubsub-js";
import {CALENDAR_NORMAL, EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY} from "../Constants";
import '../styles/ContactDetails.css';
import Moment from "react-moment";
import {avatarStyles} from "../AvatarStyles";
import googleLogo from '../assets/images/ic-google.png';

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

                    {props.contactProvidersData[props.contactData.waId]?.[0]?.companies?.[0] !== undefined &&
                        <div className="contactDetails__body__job">
                            <span>{props.contactProvidersData[props.contactData.waId]?.[0]?.companies?.[0]?.job_title}</span> at <span>{props.contactProvidersData[props.contactData.waId]?.[0]?.companies?.[0]?.company_name}</span>
                        </div>
                    }

                    <span>Last message: <Moment unix calendar={CALENDAR_NORMAL}>{props.contactData.lastMessageTimestamp}</Moment></span>
                </div>

                <div className="contactDetails__body__section">
                    <div className="contactDetails__body__section__title">Whatsapp Phone Number</div>
                    <a href={"tel:+" + props.contactData.waId}>{'+' + props.contactData.waId}</a>
                </div>

                {props.contactProvidersData[props.contactData.waId]?.map((providerData, index) =>
                    <div
                        className="contactDetails__body__section"
                        key={providerData.contact_provider.id}>

                        <div className="contactDetails__body__section__title mb-3">
                            <div className="contactDetails__body__section__providerTitle">
                                {providerData.contact_provider.type === "google" &&
                                <img className="mr-1" src={googleLogo} alt="Google" />
                                }
                                {providerData.contact_provider.name}
                            </div>
                        </div>

                        <div className="contactDetails__body__section__content mb-2">
                            <div className="contactDetails__body__section__subtitle">Phone number</div>
                            <div className="contactDetails__body__section__content__sub">
                                {providerData.phone_numbers?.map((phoneNumber, phoneNumberIndex) =>
                                    <div key={phoneNumberIndex}>
                                        <a href={"tel:+" + phoneNumber.phone_number}><span>+</span>
                                            <span>{phoneNumber.phone_number}</span></a>
                                        {phoneNumber.description &&
                                        <span className="ml-1">({phoneNumber.description})</span>
                                        }
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="contactDetails__body__section__content">
                            <div className="contactDetails__body__section__subtitle">E-mail</div>
                            <div className="contactDetails__body__section__content__sub">
                                {providerData.email_addresses?.map((emailAddress, emailAddressIndex) =>
                                    <div key={emailAddressIndex}>
                                        <a href={"mailto:" + emailAddress.email_address}>{emailAddress.email_address}</a>
                                        {emailAddress.description &&
                                        <span className="ml-1">({emailAddress.description})</span>
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
            }
        </div>
    )
}

export default ContactDetails;