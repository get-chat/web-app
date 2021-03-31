import React from "react";
import '../styles/ContactProviderHeader.css';
import googleLogo from '../assets/images/ic-google.png';

function ContactProviderHeader(props) {
    return (
        <div className="contactProviderHeader">
            {props.type === "google" &&
            <img src={googleLogo} />
            }
        </div>
    )
}

export default ContactProviderHeader;