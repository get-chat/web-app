import React from 'react';
// @ts-ignore
import googleLogo from '../../assets/images/ic-google.png';
// @ts-ignore
import whatsappLogo from '../../assets/images/ic-whatsapp.png';
// @ts-ignore
import hubspotLogo from '../../assets/images/ic-hubspot.png';

interface Props {
	type: string;
}

const ContactProviderHeader: React.FC<Props> = ({ type }) => {
	return (
		// A badge with the provider's logo, on the corner of an avatar
		<div className="absolute -right-0.75 -bottom-0.75 flex rounded-[10px] bg-white p-0.75 shadow-[0_1px_3px_var(--shadow-light)] [&>img]:size-[13px] [&>img]:align-middle">
			{type === 'whatsapp' && <img src={whatsappLogo} />}
			{type === 'google' && <img src={googleLogo} />}
			{type === 'hubspot' && <img src={hubspotLogo} />}
		</div>
	);
};

export default ContactProviderHeader;
