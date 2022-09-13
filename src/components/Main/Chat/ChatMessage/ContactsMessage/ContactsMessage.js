import React from 'react';
import { Link } from 'react-router-dom';

import { Button, Avatar } from '@material-ui/core';

import styles from './ContactsMessage.module.css';

const ContactsMessage = ({ data }) => {
	return (
		<div className={styles.root}>
			<div className={styles.header}>
				<Avatar />
				{data?.payload?.contacts?.map((contact) => (
					<div key={contact.wa_id}>{contact.name.formatted_name}</div>
				))}
			</div>

			<div className={styles.footer}>
				{data?.payload?.contacts?.map((contact) => (
					<>
						{contact.phones.length > 0 && (
							<Link to={contact.phones[0]?.wa_id}>
								<Button color="primary" variant="outlined">
									Message
								</Button>
							</Link>
						)}
						{/* TODO: after adding redux */}
						{/* <Button color="primary" variant="outlined">
							View
						</Button> */}
					</>
				))}
			</div>
		</div>
	);
};

export default ContactsMessage;
