import React, { useState } from 'react';
import '../styles/Contact.css';
import { Avatar, ListItem } from '@material-ui/core';
import ContactProviderHeader from './ContactProviderHeader';
import { useTranslation } from 'react-i18next';

function Contact(props) {
    const { t, i18n } = useTranslation();

    const [phoneNumbersVisible, setPhoneNumbersVisible] = useState(false);

    const handleClick = () => {
        if (props.data.phoneNumbers && props.data.phoneNumbers.length > 0) {
            if (props.data.phoneNumbers.length === 1) {
                const phoneNumber = props.data.phoneNumbers[0].phone_number;
                goToChat(phoneNumber);
            } else {
                setPhoneNumbersVisible((prevState) => !prevState);
            }
        } else {
            window.displayCustomError('This contact has no phone number.');
        }
    };

    const goToChat = (waId) => {
        props.verifyPhoneNumber(props.data, waId);
    };

    return (
        <div className="contactWrapper">
            <ListItem button>
                <div className="contact" onClick={handleClick}>
                    <div className="contact__avatarWrapper">
                        <Avatar src={props.data.avatar}>
                            {props.data.initials}
                        </Avatar>

                        {props.data.contactProvider !== undefined && (
                            <ContactProviderHeader
                                type={props.data.contactProvider}
                            />
                        )}
                    </div>
                    <div className="contact__info">
                        <h2>{props.data.name}</h2>

                        {props.data.phoneNumbers &&
                        props.data.phoneNumbers.length > 0 ? (
                            <div className="contact__info__phoneNumber">
                                {props.data.phoneNumbers[0].phone_number}
                            </div>
                        ) : (
                            <div className="contact__info__missingPhoneNumber">
                                {t('There is no phone number')}
                            </div>
                        )}

                        {props.data.phoneNumbers &&
                            props.data.phoneNumbers.length > 1 && (
                                <div className="contact__info__otherPhoneNumbers">
                                    <span>
                                        {t(
                                            '%d more phone number(s)',
                                            props.data.phoneNumbers?.length - 1
                                        )}
                                    </span>
                                </div>
                            )}
                    </div>
                </div>
            </ListItem>

            {phoneNumbersVisible && (
                <div className="contactPhoneNumbersChoices">
                    <h3>{t('Choose a phone number')}</h3>
                    {Object.entries(props.data.phoneNumbers).map(
                        (phoneNumber) => (
                            <div
                                key={phoneNumber[0]}
                                className="contactPhoneNumbersChoices__choice"
                                onClick={() =>
                                    goToChat(phoneNumber[1].phone_number)
                                }
                            >
                                {phoneNumber[1].phone_number}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

export default Contact;
