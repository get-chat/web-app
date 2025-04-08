import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContactModel from '@src/api/models/ContactModel';
import * as Styled from './Contact.styles';
import ContactProviderHeader from '@src/components/ContactProviderHeader';
import { ListItem } from '@mui/material';

interface Props {
	data: ContactModel;
	verifyPhoneNumber: (data: ContactModel, waId: string) => void;
}

const Contact: React.FC<Props> = ({ data, verifyPhoneNumber }) => {
	const { t } = useTranslation();
	const [phoneNumbersVisible, setPhoneNumbersVisible] = useState(false);

	const handleClick = () => {
		if (data.phoneNumbers && data.phoneNumbers.length > 0) {
			if (data.phoneNumbers.length === 1) {
				const phoneNumber = data.phoneNumbers[0].phoneNumber;
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
						{data.contactProvider !== undefined && (
							<ContactProviderHeader type={data.contactProvider} />
						)}
					</Styled.AvatarWrapper>
					<Styled.ContactInfo>
						<h2>{data.name}</h2>
						{data.phoneNumbers && data.phoneNumbers.length > 0 ? (
							<Styled.PhoneNumber>
								{data.phoneNumbers[0].phoneNumber}
							</Styled.PhoneNumber>
						) : (
							<Styled.MissingPhoneNumber>
								{t('There is no phone number')}
							</Styled.MissingPhoneNumber>
						)}
						{data.phoneNumbers && data.phoneNumbers.length > 1 && (
							<Styled.OtherPhoneNumbers>
								<span>
									{t('%d more phone number', {
										postProcess: 'sprintf',
										sprintf: [data.phoneNumbers?.length - 1],
										count: data.phoneNumbers?.length - 1,
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
					{data.phoneNumbers?.map((phoneNumber, index) => (
						<Styled.PhoneNumberChoice
							key={index}
							onClick={() => goToChat(phoneNumber.phoneNumber)}
						>
							{phoneNumber.phoneNumber}
						</Styled.PhoneNumberChoice>
					))}
				</Styled.PhoneNumbersChoices>
			)}
		</Styled.ContactWrapper>
	);
};

export default Contact;
