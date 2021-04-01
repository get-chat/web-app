import React, {useEffect, useRef, useState} from "react";
import '../styles/Contact.css';
import {Avatar, ListItem} from "@material-ui/core";
import ContactProviderHeader from "./ContactProviderHeader";
import {useHistory} from "react-router-dom";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {addPlusToPhoneNumber, getConfig} from "../Helpers";

function Contact(props) {

    const [phoneNumbersVisible, setPhoneNumbersVisible] = useState(false);

    const history = useHistory();

    let cancelTokenSourceRef = useRef();

    useEffect(() => {
        // Generate a token
        cancelTokenSourceRef.current = axios.CancelToken.source();

        return () => {
            props.setVerifying(false);
        }
    }, []);

    const handleClick = () => {
        if (props.data.phoneNumbers && props.data.phoneNumbers.length > 0) {
            if (props.data.phoneNumbers.length === 1) {
                const phoneNumber = props.data.phoneNumbers[0].phone_number;
                goToChat(phoneNumber);
            } else {
                setPhoneNumbersVisible(prevState => !prevState);
            }
        } else {
            window.displayCustomError("This contact has no phone number.");
        }
    }

    const goToChat = (waId) => {
        verifyContact(waId);
    }

    const verifyContact = (waId) => {
        props.setVerifying(true);

        axios.post( `${BASE_URL}contacts/verify/`, {
            blocking: "wait",
            contacts: [addPlusToPhoneNumber(waId)],
            force_check: true
        }, getConfig(undefined, cancelTokenSourceRef.current.token))
            .then((response) => {
                console.log("Verify", response.data);

                if (response.data.contacts && response.data.contacts.length > 0 && response.data.contacts[0].status === "valid") {
                    history.push({
                        pathname: `/main/chat/${waId}`,
                        person: {
                            name: props.data.name,
                            initials: props.data.initials,
                            avatar: props.data.avatar,
                            waId: waId
                        }
                    });
                } else {
                    window.displayCustomError("There is no WhatsApp account connected to this phone number.");
                }

                props.setVerifying(false);

            })
            .catch((error) => {
                console.log(error);
                window.displayError(error);

                props.setVerifying(false);
            });
    }

    return (
        <div className="contactWrapper">
            <ListItem button>
                <div className="contact" onClick={handleClick}>
                    <div className="contact__avatarWrapper">
                        <Avatar src={props.data.avatar}>{props.data.initials}</Avatar>
                        <ContactProviderHeader type={props.data.contactProvider} />
                    </div>
                    <div className="contact__info">
                        <h2>{props.data.name}</h2>

                        {(props.data.phoneNumbers && props.data.phoneNumbers.length > 0)
                            ?
                        <div className="contact__info__phoneNumber">
                            {props.data.phoneNumbers[0].phone_number}
                        </div>
                            :
                            <div className="contact__info__missingPhoneNumber">There is no phone number</div>
                        }

                        {(props.data.phoneNumbers && props.data.phoneNumbers.length > 1) &&
                        <div className="contact__info__otherPhoneNumbers">
                            <span>{props.data.phoneNumbers?.length - 1} more phone number(s)</span>
                        </div>
                        }
                    </div>
                </div>
            </ListItem>

            {phoneNumbersVisible &&
            <div className="contactPhoneNumbersChoices">
                <h3>Choose a phone number</h3>
                { Object.entries(props.data.phoneNumbers).map((phoneNumber) =>
                    <div
                        key={phoneNumber[0]}
                        className="contactPhoneNumbersChoices__choice"
                        onClick={() => goToChat(phoneNumber[1].phone_number)}>
                        {phoneNumber[1].phone_number}
                    </div>
                )}
            </div>
            }
        </div>
    )
}

export default Contact;