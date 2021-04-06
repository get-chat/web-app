import React from "react";
import '../styles/ContactProviderHeader.css';
import googleLogo from '../assets/images/ic-google.png';
import whatsappLogo from '../assets/images/ic-whatsapp.png';

function ContactProviderHeader(props) {
    return (
        <div className="contactProviderHeader">
            {props.type === "google" &&
            <img src={googleLogo} />
            }
            {props.type === "whatsapp" &&
            <img src={whatsappLogo} />
            }
        </div>
    )
}

export default ContactProviderHeader;