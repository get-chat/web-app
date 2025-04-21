import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Styled from './Contact.styles';
import ContactProviderHeader from '@src/components/ContactProviderHeader';
import { ListItem } from '@mui/material';
import { Contact } from '@src/types/contacts';

interface Props {
	data: Contact;
	verifyPhoneNumber: (data: Contact, waId: string) => void;
}

const ContactView: React.FC<Props> = ({ data, verifyPhoneNumber }) => {
	const { t } = useTranslation();
	const [phoneNumbersVisible, setPhoneNumbersVisible] = useState(false);

	const handleClick = () => {
		if (data.phone_numbers && data.phone_numbers.length > 0) {
			if (data.phone_numbers.length === 1) {
				const phoneNumber = data.phone_numbers[0].phone_number;
				goToChat(phoneNumber);
			} else {
				setPhoneNumbersVisible((prevState) => !prevState);
			}
		} else {
			// @ts-ignore
			window.displayCustomError('This contact has no phone number.');
		}
	};

	const goToChat = (waId?: string) => {
		verifyPhoneNumber(data, waId ?? '');
	};

	return (
		<Styled.ContactWrapper>
			<ListItem button>
				<Styled.ContactContainer onClick={handleClick}>
					<Styled.AvatarWrapper>
						<Styled.StyledCustomAvatar src={data.avatar}>
							{data.initials}
						</Styled.StyledCustomAvatar>
						{data.contact_provider !== undefined && (
							<ContactProviderHeader type={data.contact_provider.type} />
						)}
					</Styled.AvatarWrapper>
					<Styled.ContactInfo>
						<h2>{data.name}</h2>
						{data.phone_numbers && data.phone_numbers.length > 0 ? (
							<Styled.PhoneNumber>
								{data.phone_numbers[0].phone_number}
							</Styled.PhoneNumber>
						) : (
							<Styled.MissingPhoneNumber>
								{t('There is no phone number')}
							</Styled.MissingPhoneNumber>
						)}
						{data.phone_numbers && data.phone_numbers.length > 1 && (
							<Styled.OtherPhoneNumbers>
								<span>
									{t('%d more phone number', {
										postProcess: 'sprintf',
										sprintf: [data.phone_numbers?.length - 1],
										count: data.phone_numbers?.length - 1,
									})}
								</span>
							</Styled.OtherPhoneNumbers>
						)}
					</Styled.ContactInfo>
				</Styled.ContactContainer>
			</ListItem>

			{phoneNumbersVisible && (
				<Styled.PhoneNumbersChoices>
					<h3>{t('Choose a phone number')}</h3>
					{data.phone_numbers?.map((phoneNumber, index) => (
						<Styled.PhoneNumberChoice
							key={index}
							onClick={() => goToChat(phoneNumber.phone_number)}
						>
							{phoneNumber.phone_number}
						</Styled.PhoneNumberChoice>
					))}
				</Styled.PhoneNumbersChoices>
			)}
		</Styled.ContactWrapper>
	);
};

export default ContactView;
