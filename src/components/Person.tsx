import React from 'react';
import '../styles/Contact.css';
import { ListItem } from '@mui/material';
import ContactProviderHeader from './ContactProviderHeader';
import CustomAvatar from '@src/components/CustomAvatar';
import PersonModel from '@src/api/models/PersonModel';

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
		<div className="contactWrapper">
			<ListItem button>
				<div className="contact" onClick={handleClick}>
					<div className="contact__avatarWrapper">
						<CustomAvatar
							src={contactProvidersData[data.waId ?? '']?.[0]?.avatar}
							generateBgColorBy={data.name}
						>
							{data.initials}
						</CustomAvatar>
						<ContactProviderHeader type="whatsapp" />
					</div>
					<div className="contact__info">
						<h2>
							{contactProvidersData[data.waId ?? '']?.[0]?.name ?? data.name}
						</h2>

						<div className="contact__info__phoneNumber">{data.waId}</div>
					</div>
				</div>
			</ListItem>
		</div>
	);
};

export default Person;
