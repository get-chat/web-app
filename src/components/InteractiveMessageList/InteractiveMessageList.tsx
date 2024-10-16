import styles from './InteractiveMessageList.module.css';
import { Button } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SendInteractiveMessageDialog from '@src/components/SendInteractiveMessageDialog';

const INTERACTIVE_MESSAGES = [
	{
		title: 'Send location request message',
		description:
			'Location request message is a free-form message displaying only a <strong>body text</strong> and a <strong>send location button</strong>. When a WhatsApp user taps the button, a location sharing screen appears. The user can share their location from the sharing screen.',
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
						{INTERACTIVE_MESSAGES.map((item, index) => (
							<div className={styles.item} key={index}>
								<Button
									onClick={() => {
										setSelectedInteractiveMessage(item.payload);
										setDialogVisible(true);
									}}
									// @ts-ignore
									color="black"
								>
									<div>
										<h4>{t(item.title)}</h4>
										<div
											className={styles.description}
											dangerouslySetInnerHTML={{ __html: t(item.description) }}
										/>
									</div>
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
