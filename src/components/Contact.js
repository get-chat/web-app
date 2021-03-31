import React, {useState} from "react";
import '../styles/Contact.css';
import {Avatar, ListItem} from "@material-ui/core";
import ContactProviderHeader from "./ContactProviderHeader";

function Contact(props) {

    const [phoneNumbersVisible, setPhoneNumbersVisible] = useState(false);

    const handleClick = () => {
        if (props.data.phoneNumbers && props.data.phoneNumbers.length > 0) {
            if (props.data.phoneNumbers.length === 1) {
                const phoneNumber = props.data.phoneNumbers[0].phone_number;
            } else {
                setPhoneNumbersVisible(prevState => !prevState);
            }
        }
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

                        {(props.data.phoneNumbers && props.data.phoneNumbers.length > 0) &&
                        <div className="contact__info__phoneNumber">
                            {props.data.phoneNumbers[0].phone_number}
                        </div>
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
                    <div key={phoneNumber[0]} className="contactPhoneNumbersChoices__choice">
                        {phoneNumber[1].phone_number}
                    </div>
                )}
            </div>
            }
        </div>
    )
}

export default Contact;