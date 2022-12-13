import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';

import ChatMessageModel from '../../api/models/ChatMessageModel';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import Contact from '../Contact';
import ContactModel from '../../api/models/ContactModel';

import styles from './ContactsModal.module.css';

const DialogHeader = ({ children, onClose, ...rest }) => (
	<DialogTitle className={styles.header} {...rest}>
		<Typography variant="h6">{children}</Typography>
		{onClose && (
			<IconButton aria-label="close" onClick={onClose} size="large">
				<CloseIcon />
			</IconButton>
		)}
	</DialogTitle>
);

const ContactsModal = ({ open, onClose, sendMessage, recipientWaId }) => {
	const { apiService } = React.useContext(ApplicationContext);
	const [selectedContact, setSelectedContact] = useState(null);
	const [contacts, setContacts] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);

		apiService.listContactsCall(
			undefined,
			0,
			undefined,
			(response) => {
				const preparedContacts = {};

				response.data.results.forEach((contact, contactIndex) => {
					preparedContacts[contactIndex] = new ContactModel(contact);
				});

				setContacts(preparedContacts);
				setIsLoading(false);
			},
			(error) => {
				console.error(error);
				setIsLoading(false);
			}
		);
	}, []);

	const handleClose = () => {
		onClose();
		setSelectedContact(null);
	};

	const handleSendMessage = () => {
		const payload = {
			wa_id: recipientWaId,
			type: ChatMessageModel.TYPE_CONTACTS,
			contacts: [
				{
					name: {
						formatted_name: selectedContact.name,
					},
					phones: selectedContact.phoneNumbers.map((phone) => ({
						wa_id: phone?.phone_number || null,
					})),
				},
			],
		};

		sendMessage(
			false,
			undefined,
			payload,
			() => {
				handleClose();
			},
			(error) => {
				console.log('error', error);
				handleClose();
			}
		);
	};

	if (isLoading) {
		return null;
	}

	return (
		<Dialog open={open} onClose={handleClose}>
			<DialogHeader onClose={handleClose}>Send contacts</DialogHeader>
			<DialogContent classes={{ root: styles.content }} dividers>
				{Object.keys(contacts).length === 0 ? (
					<h3 className={styles.emptyTitle}>
						You don't have contacts in your contact list
					</h3>
				) : (
					<List>
						{Object.entries(contacts).map(([key, value], index) => (
							<ListItem
								key={key}
								divider={Object.keys(contacts).length !== index + 1}
								button
								selected={selectedContact?.name === value.name}
								onClick={() => setSelectedContact(value)}
							>
								<ListItemAvatar>
									<Avatar alt={value.name}>{value.initials}</Avatar>
								</ListItemAvatar>
								<ListItemText primary={value.name} />
								<ListItemSecondaryAction>
									<Checkbox
										edge="end"
										checked={selectedContact?.name === value.name}
										onClick={() => setSelectedContact(value)}
									/>
								</ListItemSecondaryAction>
							</ListItem>
						))}
					</List>
				)}
			</DialogContent>
			{selectedContact && (
				<DialogActions>
					<Button onClick={handleSendMessage}>Send</Button>
				</DialogActions>
			)}
		</Dialog>
	);
};

export default ContactsModal;
