import React, { useContext, useState } from 'react';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';
import { Button } from '@src/components/ui/button';
import { Trans, useTranslation } from 'react-i18next';
import { getHubURL } from '@src/helpers/URLHelper';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import Contacts from '@src/components/Contacts';
import { AxiosResponse } from 'axios';
import { MessageType } from '@src/types/messages';
import { Recipient } from '@src/types/persons';

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
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						{t('Send contacts')}
					</DialogTitle>
				</DialogHeader>
				<DialogBody className="flex min-h-50 flex-1 flex-col p-0">
					<Contacts
						isSelectionModeEnabled={true}
						selectedContacts={selectedContacts}
						onSelect={handleSelect}
						noContactsContent={
							<div className="px-3.75 py-2.5 text-center font-normal">
								<Trans>
									To be able to share contacts, you need to use one of our
									Contact Providers.{' '}
									<a
										className="text-light-blue"
										href={getHubURL(config?.API_BASE_URL ?? '')}
									>
										Click here
									</a>{' '}
									to go to our integrations page.
								</Trans>
							</div>
						}
					/>
				</DialogBody>
				{selectedContacts.length > 0 && (
					<DialogFooter>
						<Button variant="ghost" color="primary" onClick={handleSendMessage}>
							{t('Send')}
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default ContactsModal;
