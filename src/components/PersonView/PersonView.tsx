import React from 'react';
import { ListItem } from '@mui/material';
import ContactProviderHeader from '../ContactProviderHeader';
import * as Styled from '@src/components/ContactView/Contact.styles';
import { Person } from '@src/types/persons';

interface Props {
	data: Person;
	verifyPhoneNumber: (data: Person, waId: string) => void;
	contactProvidersData: { [key: string]: any };
}

const PersonView: React.FC<Props> = ({
	data,
	verifyPhoneNumber,
	contactProvidersData,
}) => {
	const handleClick = () => {
		if (data.wa_id) {
			goToChat(data.wa_id);
		}
	};

	const goToChat = (waId: string) => {
		verifyPhoneNumber(data, waId);
	};

	return (
		<Styled.ContactWrapper>
			<ListItem button>
				<Styled.ContactContainer onClick={handleClick}>
					<Styled.AvatarWrapper>
						<Styled.StyledCustomAvatar
							src={contactProvidersData[data.wa_id ?? '']?.[0]?.avatar}
							generateBgColorBy={data.waba_payload?.profile?.name}
						>
							{data.initials}
						</Styled.StyledCustomAvatar>
						<ContactProviderHeader type="whatsapp" />
					</Styled.AvatarWrapper>
					<Styled.ContactInfo>
						<h2>
							{contactProvidersData[data.wa_id ?? '']?.[0]?.name ??
								data.waba_payload?.profile?.name}
						</h2>
						<Styled.PhoneNumber>{data.wa_id}</Styled.PhoneNumber>
					</Styled.ContactInfo>
				</Styled.ContactContainer>
			</ListItem>
		</Styled.ContactWrapper>
	);
};

export default PersonView;
