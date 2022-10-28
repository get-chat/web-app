import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { Button, Avatar } from '@material-ui/core';

import styles from './ContactsMessage.module.css';

const ContactsMessage = ({ data }) => {
	return (
		<div className={styles.root}>
			<div className={styles.header}>
				<Avatar />
				{data?.payload?.contacts?.map((contact, contactIndex) => (
					<div key={contactIndex}>{contact.name.formatted_name}</div>
				))}
			</div>

			<div className={styles.footer}>
				{data?.payload?.contacts?.map((contact, contactIndex) => (
					<Fragment key={contactIndex}>
						{Boolean(contact.phones.length) && (
							<Link to={contact.phones[0].wa_id}>
								<Button color="primary" variant="outlined">
									Message
								</Button>
							</Link>
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
