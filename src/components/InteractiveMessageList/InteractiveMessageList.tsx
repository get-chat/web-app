import styles from './InteractiveMessageList.module.css';
import { Button, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
	const [text, setText] = useState('');

	const send = (payload: any) => {
		payload.body.text = text;
		onSend(payload);
	};

	return (
		<div className="interactiveMessagesOuter">
			<div className="interactiveMessagesWrapper">
				<div className="interactiveMessages">
					{/*<div className={styles.textFieldWrapper}>
						<TextField
							variant="filled"
							value={text}
							onChange={(e) => setText(e.target.value)}
							label={t('Enter your message here')}
							size="medium"
							multiline={true}
							fullWidth={true}
						/>
					</div>*/}

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
								onClick={() => send(item)}
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
	);
};

export default InteractiveMessageList;
