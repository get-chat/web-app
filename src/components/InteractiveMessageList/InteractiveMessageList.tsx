import styles from './InteractiveMessageList.module.css';
import { Button } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SendInteractiveMessageDialog from '@src/components/SendInteractiveMessageDialog';

const INTERACTIVE_MESSAGES = [
	{
		title: 'Send location request message',
		description:
			'Location request message is a free-form message displaying only a body text and a send location button. When a WhatsApp user taps the button, a location sharing screen appears. The user can share their location from the sharing screen.',
		payload: {
			type: 'location_request_message',
			body: {
				text: '',
			},
			action: {
				name: 'send_location',
			},
		},
	},
];

interface Props {
	onSend: (interactiveMessage: any) => void;
}

const InteractiveMessageList: React.FC<Props> = ({ onSend }) => {
	const { t } = useTranslation();
	const [selectedInteractiveMessage, setSelectedInteractiveMessage] =
		useState<any>(null);
	const [isDialogVisible, setDialogVisible] = useState(false);

	const send = (payload: any) => {
		onSend(payload);
	};

	return (
		<>
			<div className="interactiveMessagesOuter">
				<div className="interactiveMessagesWrapper">
					<div className="interactiveMessages">
						{INTERACTIVE_MESSAGES.map((item) => (
							<div className={styles.item}>
								<div>
									<h4>{item.title}</h4>
									<div>{item.description}</div>
								</div>
								<Button
									onClick={() => {
										setSelectedInteractiveMessage(item.payload);
										setDialogVisible(true);
									}}
									// @ts-ignore
									color="black"
								>
									{t('Send')}
								</Button>
							</div>
						))}
					</div>
				</div>
			</div>

			<SendInteractiveMessageDialog
				isVisible={isDialogVisible}
				setVisible={setDialogVisible}
				interactiveMessage={selectedInteractiveMessage}
				onSend={(interactiveMessage) => send(interactiveMessage)}
			/>
		</>
	);
};

export default InteractiveMessageList;
