import React from 'react';
// @ts-ignore
import googleLogo from '../../assets/images/ic-google.png';
// @ts-ignore
import whatsappLogo from '../../assets/images/ic-whatsapp.png';
// @ts-ignore
import hubspotLogo from '../../assets/images/ic-hubspot.png';
import * as Styled from './ContactProviderHeader.styles';

interface Props {
	type: string;
}

const ContactProviderHeader: React.FC<Props> = ({ type }) => {
	return (
		<Styled.Wrapper>
			{type === 'whatsapp' && <img src={whatsappLogo} />}
			{type === 'google' && <img src={googleLogo} />}
			{type === 'hubspot' && <img src={hubspotLogo} />}
		</Styled.Wrapper>
	);
};

export default ContactProviderHeader;
