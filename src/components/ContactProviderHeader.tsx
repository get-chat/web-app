import React from 'react';
import '../styles/ContactProviderHeader.css';
// @ts-ignore
import googleLogo from '../assets/images/ic-google.png';
// @ts-ignore
import whatsappLogo from '../assets/images/ic-whatsapp.png';
// @ts-ignore
import hubspotLogo from '../assets/images/ic-hubspot.png';

interface Props {
	type: string;
}

const ContactProviderHeader: React.FC<Props> = ({ type }) => {
	return (
		<div className="contactProviderHeader">
			{type === 'whatsapp' && <img src={whatsappLogo} />}
			{type === 'google' && <img src={googleLogo} />}
			{type === 'hubspot' && <img src={hubspotLogo} />}
		</div>
	);
};

export default ContactProviderHeader;
