import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@mui/material';

import styles from './ContactsMessage.module.css';
import { prepareWaId } from '@src/helpers/PhoneNumberHelper';
import CustomAvatar from '@src/components/CustomAvatar';
import ChatIcon from '@mui/icons-material/Chat';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { generateAvatarColor } from '@src/helpers/AvatarHelper';

const ContactsMessage = ({ data }) => {
	const navigate = useNavigate();
	const { contacts } = data?.payload || data?.resendPayload;

	const handleClick = (contact) => {
		const waId = prepareWaId(contact.phones[0].wa_id);
		navigate(`/main/chat/${waId}`);
	};

	return (
		<div className={styles.root}>
			{contacts?.map((contact, contactIndex) => (
				<div key={contactIndex} className={styles.item}>
					<div className={styles.header}>
						<>
							<CustomAvatar
								className={styles.avatar}
								style={{
									backgroundColor: generateAvatarColor(
										contact.name.formatted_name
									),
								}}
							>
								{generateInitialsHelper(contact.name.formatted_name)}
							</CustomAvatar>
							<div key={contactIndex} className={styles.name}>
								{contact.name.formatted_name}
							</div>
						</>
					</div>
					<div className={styles.footer}>
						{contact.phones?.map((phoneObj, phoneObjIndex) => (
							<Button
								key={phoneObjIndex}
								color="primary"
								variant="text"
								size="medium"
								startIcon={<ChatIcon />}
								className={styles.messageButton}
								onClick={() => handleClick(contact)}
							>
								{phoneObj?.type && <span>{phoneObj.type}</span>}
								{phoneObj.phone ?? phoneObj.wa_id}
							</Button>
						))}
					</div>
				</div>
			))}
		</div>
	);
};

export default ContactsMessage;
