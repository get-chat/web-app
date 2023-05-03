import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import ChatMessageModel from '../../api/models/ChatMessageModel';

import styles from './ContactsModal.module.css';
import { Trans, useTranslation } from 'react-i18next';
import { getHubURL } from '@src/helpers/URLHelper';
import { AppConfig } from '@src/contexts/AppConfig';
import Contacts from '@src/components/Contacts';
import Recipient from '@src/api/models/interfaces/Recipient';
import { AxiosResponse } from 'axios';

interface DialogHeaderProps {
	children?: JSX.Element | string;
	onClose: () => void;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({
	children,
	onClose,
	...rest
}) => (
	<DialogTitle className={styles.header} {...rest}>
		{children}
	</DialogTitle>
);

interface Props {
	open: boolean;
	onClose: () => void;
	sendMessage: (
		payload: any,
		onSuccess: (response: AxiosResponse) => void,
		onError: (error: AxiosResponse) => void
	) => void;
	recipientWaId: string;
}

const ContactsModal: React.FC<Props> = ({
	open,
	onClose,
	sendMessage,
	recipientWaId,
}) => {
	const config: any = React.useContext(AppConfig);

	const [selectedContacts, setSelectedContacts] = useState<Recipient[]>([]);

	const { t } = useTranslation();

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
					wa_id: phone?.phoneNumber || null,
				})),
			})),
		};

		sendMessage(
			payload,
			() => {
				handleClose();
			},
			(error: AxiosResponse) => {
				console.log('error', error);
				handleClose();
			}
		);
	};

	const handleSelect = (recipient: Recipient) => {
		if (selectedContacts.find((item) => item.name === recipient.name)) {
			setSelectedContacts(
				selectedContacts.filter((item) => item.name !== recipient.name)
			);
		} else {
			setSelectedContacts([...selectedContacts, recipient]);
		}
	};

	return (
		<Dialog open={open} onClose={handleClose} fullWidth>
			<DialogHeader onClose={handleClose}>{t('Send contacts')}</DialogHeader>
			<DialogContent
				classes={{ root: styles.content }}
				className={'noPadding'}
				dividers
			>
				<Contacts
					isSelectionModeEnabled={true}
					selectedContacts={selectedContacts}
					onSelect={handleSelect}
					noContactsContent={
						<div
							style={{
								padding: '10px 15px',
							}}
						>
							<Trans>
								To be able to share contacts, you need to use one of our Contact
								Providers.{' '}
								<a href={getHubURL(config.API_BASE_URL)}>Click here</a> to go to
								our integrations page.
							</Trans>
						</div>
					}
				/>
			</DialogContent>
			{selectedContacts.length > 0 && (
				<DialogActions>
					<Button onClick={handleSendMessage}>{t('Send')}</Button>
				</DialogActions>
			)}
		</Dialog>
	);
};

export default ContactsModal;
