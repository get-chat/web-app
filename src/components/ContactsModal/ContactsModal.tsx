import React, { useContext, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Trans, useTranslation } from 'react-i18next';
import { getHubURL } from '@src/helpers/URLHelper';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import Contacts from '@src/components/Contacts';
import { AxiosResponse } from 'axios';
import { MessageType } from '@src/types/messages';
import { Recipient } from '@src/types/persons';
import * as Styled from './ContactsModal.styles';

interface Props {
	open: boolean;
	onClose: () => void;
	sendMessage: (
		payload: any,
		onSuccess: () => void,
		onError: (error: AxiosResponse) => void
	) => void;
	recipientWaId: string | undefined;
}

const ContactsModal: React.FC<Props> = ({
	open,
	onClose,
	sendMessage,
	recipientWaId,
}) => {
	const config = useContext(AppConfigContext);

	const [selectedContacts, setSelectedContacts] = useState<Recipient[]>([]);

	const { t } = useTranslation();

	const handleClose = () => {
		onClose();
		setSelectedContacts([]);
	};

	const handleSendMessage = () => {
		const payload = {
			wa_id: recipientWaId,
			type: MessageType.contacts,
			contacts: [...selectedContacts].map((contact) => ({
				name: {
					formatted_name: contact.name,
				},
				phones: contact.phone_numbers.map((phone) => ({
					wa_id: phone?.phone_number || null,
				})),
			})),
		};

		sendMessage(payload, handleClose, (error: AxiosResponse) => {
			console.log('error', error);
			handleClose();
		});
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
			<Styled.StyledDialogTitle>{t('Send contacts')}</Styled.StyledDialogTitle>
			<Styled.StyledDialogContent>
				<Contacts
					isSelectionModeEnabled={true}
					selectedContacts={selectedContacts}
					onSelect={handleSelect}
					noContactsContent={
						<Styled.NoContactsContent>
							<Trans>
								To be able to share contacts, you need to use one of our Contact
								Providers.{' '}
								<a href={getHubURL(config?.API_BASE_URL ?? '')}>Click here</a>{' '}
								to go to our integrations page.
							</Trans>
						</Styled.NoContactsContent>
					}
				/>
			</Styled.StyledDialogContent>
			{selectedContacts.length > 0 && (
				<DialogActions>
					<Button onClick={handleSendMessage}>{t('Send')}</Button>
				</DialogActions>
			)}
		</Dialog>
	);
};

export default ContactsModal;
