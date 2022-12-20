import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@mui/material';

import styles from './ContactsMessage.module.css';
import { preparePhoneNumber } from '@src/helpers/PhoneNumberHelper';
import CustomAvatar from '@src/components/CustomAvatar';

const ContactsMessage = ({ data }) => {
	const navigate = useNavigate();

	const handleClick = (contact) => {
		const waId = preparePhoneNumber(contact.phones[0].wa_id);
		navigate(`/main/chat/${waId}`);
	};

	return (
		<div className={styles.root}>
			<div className={styles.header}>
				<CustomAvatar className={styles.avatar} />
				{data?.payload?.contacts?.map((contact, contactIndex) => (
					<div key={contactIndex} className={styles.name}>
						{contact.name.formatted_name}
					</div>
				))}
			</div>

			<div className={styles.footer}>
				{data?.payload?.contacts?.map((contact, contactIndex) => (
					<Fragment key={contactIndex}>
						{Boolean(contact.phones.length) && (
							<Button
								color="primary"
								variant="text"
								size="medium"
								className={styles.messageButton}
								onClick={() => handleClick(contact)}
							>
								Message
							</Button>
						)}
						{/* TODO: after adding redux */}
						{/* <Button color="primary" variant="outlined">
							View
						</Button> */}
					</Fragment>
				))}
			</div>
		</div>
	);
};

export default ContactsMessage;
