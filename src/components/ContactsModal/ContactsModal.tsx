// @ts-nocheck
import React, { useEffect, useState } from 'react';
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
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';

import ChatMessageModel from '../../api/models/ChatMessageModel';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import ContactModel from '../../api/models/ContactModel';

import styles from './ContactsModal.module.css';
import CustomAvatar from '@src/components/CustomAvatar';
import ContactsResponse from '@src/api/responses/ContactsResponse';
import { CONTACTS_TEMP_LIMIT } from '@src/Constants';
import { Trans, useTranslation } from 'react-i18next';
import { getHubURL } from '@src/helpers/URLHelper';

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
	const [selectedContacts, setSelectedContacts] = useState([]);
	const [contacts, setContacts] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const { t } = useTranslation();

	useEffect(() => {
		setIsLoading(true);

		apiService.listContactsCall(
			undefined,
			CONTACTS_TEMP_LIMIT,
			undefined,
			undefined,
			(response) => {
				const contactsResponse = new ContactsResponse(response.data);
				setContacts(contactsResponse.contacts);
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
		setSelectedContacts([]);
	};

	const handleSendMessage = () => {
		const payload = {
			wa_id: recipientWaId,
			type: ChatMessageModel.TYPE_CONTACTS,
			contacts: [...selectedContacts].map((contact) => ({
				name: {
					formatted_name: contact.name,
				},
				phones: contact.phoneNumbers.map((phone) => ({
					wa_id: phone?.phone_number || null,
				})),
			})),
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

	const handleSetSelectedContacts = (contact) => {
		if (selectedContacts.find((item) => item.name === contact.name)) {
			setSelectedContacts(
				selectedContacts.filter((item) => item.name !== contact.name)
			);
		} else {
			setSelectedContacts([...selectedContacts, contact]);
		}
	};

	if (isLoading) {
		return null;
	}

	return (
		<Dialog open={open} onClose={handleClose}>
			<DialogHeader onClose={handleClose}>Send contacts</DialogHeader>
			<DialogContent classes={{ root: styles.content }} dividers>
				{Object.keys(contacts).length === 0 ? (
					<>
						<Trans>
							To be able to share contacts, you need to use one of our Contact
							Providers.
							<a href={getHubURL(config.API_BASE_URL)}> Click here </a> to go to
							our integrations page.
						</Trans>
					</>
				) : (
					<List>
						{Object.entries(contacts).map(([key, value], index) => (
							<ListItem
								key={key}
								divider={Object.keys(contacts).length !== index + 1}
								button
								selected={selectedContacts.find(
									(item) => item.name === value.name
								)}
								onClick={() => handleSetSelectedContacts(value)}
							>
								<ListItemAvatar>
									<CustomAvatar alt={value.name}>{value.initials}</CustomAvatar>
								</ListItemAvatar>
								<ListItemText primary={value.name} />
								<ListItemSecondaryAction>
									<Checkbox
										edge="end"
										checked={selectedContacts.find(
											(item) => item.name === value.name
										)}
										onClick={() => handleSetSelectedContacts(value)}
									/>
								</ListItemSecondaryAction>
							</ListItem>
						))}
					</List>
				)}
			</DialogContent>
			{selectedContacts.length > 0 && (
				<DialogActions>
					<Button onClick={handleSendMessage}>Send</Button>
				</DialogActions>
			)}
		</Dialog>
	);
};

export default ContactsModal;
