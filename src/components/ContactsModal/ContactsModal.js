import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';

import ChatMessageClass from '../../ChatMessageClass';
import { ApplicationContext } from '../../contexts/ApplicationContext';
import Contact from '../Contact';
import ContactClass from '../../ContactClass';

import styles from './ContactsModal.module.css';

const DialogHeader = ({ children, onClose, ...rest }) => (
	<DialogTitle disableTypography className={styles.header} {...rest}>
		<Typography variant="h6">{children}</Typography>
		{onClose && (
			<IconButton aria-label="close" onClick={onClose}>
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
					preparedContacts[contactIndex] = new ContactClass(contact);
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
			type: ChatMessageClass.TYPE_CONTACTS,
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
