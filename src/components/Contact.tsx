import React, { useState } from 'react';
import '../styles/Contact.css';
import { ListItem } from '@mui/material';
import ContactProviderHeader from './ContactProviderHeader';
import { useTranslation } from 'react-i18next';
import CustomAvatar from '@src/components/CustomAvatar';
import ContactModel from '@src/api/models/ContactModel';

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
		<div className="contactWrapper">
			<ListItem button>
				<div className="contact" onClick={handleClick}>
					<div className="contact__avatarWrapper">
						<CustomAvatar src={data.avatar}>{data.initials}</CustomAvatar>

						{data.contactProvider !== undefined && (
							<ContactProviderHeader type={data.contactProvider} />
						)}
					</div>
					<div className="contact__info">
						<h2>{data.name}</h2>

						{data.phoneNumbers && data.phoneNumbers.length > 0 ? (
							<div className="contact__info__phoneNumber">
								{data.phoneNumbers[0].phoneNumber}
							</div>
						) : (
							<div className="contact__info__missingPhoneNumber">
								{t('There is no phone number')}
							</div>
						)}

						{data.phoneNumbers && data.phoneNumbers.length > 1 && (
							<div className="contact__info__otherPhoneNumbers">
								<span>
									{t('%d more phone number', {
										postProcess: 'sprintf',
										sprintf: [data.phoneNumbers?.length - 1],
										count: data.phoneNumbers?.length - 1,
									})}
								</span>
							</div>
						)}
					</div>
				</div>
			</ListItem>

			{phoneNumbersVisible && (
				<div className="contactPhoneNumbersChoices">
					<h3>{t('Choose a phone number')}</h3>
					{Object.entries(data.phoneNumbers).map((phoneNumber) => (
						<div
							key={phoneNumber[0]}
							className="contactPhoneNumbersChoices__choice"
							onClick={() => goToChat(phoneNumber[1].phoneNumber)}
						>
							{phoneNumber[1].phoneNumber}
							{phoneNumber[1].phoneNumber}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Contact;
