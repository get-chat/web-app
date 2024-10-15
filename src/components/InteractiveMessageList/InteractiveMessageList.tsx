import styles from './InteractiveMessageList.module.css';
import { Button } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SendInteractiveMessageDialog from '@src/components/SendInteractiveMessageDialog';

const INTERACTIVE_MESSAGES = [
	{
		type: 'location_request_message',
		body: {
			text: '',
		},
		action: {
			name: 'send_location',
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
								<div className="chat__message chat__outgoing messageType__interactive">
									<h4>{item.type}</h4>
									{Object.entries(item)
										.filter((entry) => entry[0] !== 'type')
										.map((entry) => (
											<div>
												<span className="templateType bold lowercase">
													{entry[0]}:
												</span>{' '}
												{JSON.stringify(entry[1])}
											</div>
										))}
								</div>
								<Button
									onClick={() => {
										setSelectedInteractiveMessage(item);
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
