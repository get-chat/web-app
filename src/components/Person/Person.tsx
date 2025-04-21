import React from 'react';
import { ListItem } from '@mui/material';
import ContactProviderHeader from '../ContactProviderHeader';
import PersonModel from '@src/api/models/PersonModel';
import * as Styled from '../Contact/Contact.styles';

interface Props {
	data: PersonModel;
	verifyPhoneNumber: (data: PersonModel, waId: string) => void;
	contactProvidersData: { [key: string]: any };
}

const Person: React.FC<Props> = ({
	data,
	verifyPhoneNumber,
	contactProvidersData,
}) => {
	const handleClick = () => {
		if (data.waId) {
			goToChat(data.waId);
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
							src={contactProvidersData[data.waId ?? '']?.[0]?.avatar}
							generateBgColorBy={data.name}
						>
							{data.initials}
						</Styled.StyledCustomAvatar>
						<ContactProviderHeader type="whatsapp" />
					</Styled.AvatarWrapper>
					<Styled.ContactInfo>
						<h2>
							{contactProvidersData[data.waId ?? '']?.[0]?.name ?? data.name}
						</h2>
						<Styled.PhoneNumber>{data.waId}</Styled.PhoneNumber>
					</Styled.ContactInfo>
				</Styled.ContactContainer>
			</ListItem>
		</Styled.ContactWrapper>
	);
};

export default Person;
