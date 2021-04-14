import React from "react";
import '../styles/ContactProviderHeader.css';
import googleLogo from '../assets/images/ic-google.png';
import whatsappLogo from '../assets/images/ic-whatsapp.png';
import hubspotLogo from '../assets/images/ic-hubspot.png';

function ContactProviderHeader(props) {
    return (
        <div className="contactProviderHeader">
            {props.type === "whatsapp" &&
            <img src={whatsappLogo} />
            }
            {props.type === "google" &&
            <img src={googleLogo} />
            }
            {props.type === "hubspot" &&
            <img src={hubspotLogo} />
            }
        </div>
    )
}

export default ContactProviderHeader;