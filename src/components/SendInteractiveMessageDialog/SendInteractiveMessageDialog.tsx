import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Button, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './SendInteractiveMessageDialog.module.css';
import { isEmptyString } from '@src/helpers/Helpers';
import ChatMessage from '@src/components/Main/Chat/ChatMessage/ChatMessage';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { DescribedInteractive } from '@src/components/InteractiveMessageList/InteractiveMessageList';

export type Props = {
	isVisible: boolean;
	setVisible: (visible: boolean) => void;
	describedInteractive?: DescribedInteractive;
	onSend: (interactiveMessage: any) => void;
};

const SendInteractiveMessageDialog: React.FC<Props> = ({
	isVisible,
	setVisible,
	describedInteractive,
	onSend,
}) => {
	const [text, setText] = useState('');
	const [payload, setPayload] = useState({});
	const [messageData, setMessageData] = useState<ChatMessageModel | null>(null);

	const { t } = useTranslation();

	useEffect(() => {
		setPayload(describedInteractive?.payload ?? {});
	}, [describedInteractive]);

	useEffect(() => {
		if (describedInteractive) {
			const clone = { ...payload };
			setMessageData(ChatMessageModel.fromInteractive(clone));
		}
	}, [payload, describedInteractive]);

	useEffect(() => {
		if (isVisible) {
			setText('');
		}
	}, [isVisible]);

	const close = () => {
		setVisible(false);
	};

	const updateTextAndSend = () => {
		if (describedInteractive) {
			const clone = { ...describedInteractive.payload };
			clone.body.text = text;
			onSend(clone);
		}

		close();
	};

	function getNestedValue(obj: any, path: string) {
		return path.split('.').reduce((acc, key) => acc && acc[key], obj);
	}

	function setNestedValue(obj: any, path: string, value: any) {
		const keys = path.split('.');
		const lastKey = keys.pop(); // Get the last key (e.g., 'display_text')

		// Traverse the object to the second-to-last key
		const nestedObj = keys.reduce((acc, key) => acc && acc[key], obj);

		if (nestedObj && lastKey) {
			nestedObj[lastKey] = value; // Set the new value
		}

		return { ...obj };
	}

	return (
		<Dialog open={isVisible} onClose={close}>
			<DialogTitle>
				{t(describedInteractive?.title ?? 'Send an interactive message')}
			</DialogTitle>
			<DialogContent>
				{describedInteractive && (
					<div className={styles.container}>
						<div>
							<div
								className={styles.description}
								dangerouslySetInnerHTML={{
									__html: t(describedInteractive.description),
								}}
							/>
							<div>
								{payload &&
									describedInteractive.parameters.map((key) => (
										<div className={styles.textFieldWrapper} key={key}>
											<TextField
												variant="standard"
												value={getNestedValue(payload, key)}
												onChange={(e) =>
													setPayload((prevState) =>
														setNestedValue(prevState, key, e.target.value)
													)
												}
												label={t(key)}
												size="medium"
												multiline={true}
												fullWidth={true}
											/>
										</div>
									))}
							</div>
						</div>

						<div className={styles.previewContainer}>
							{messageData && (
								<ChatMessage
									data={messageData}
									disableMediaPreview
									isInfoClickable={false}
								/>
							)}
						</div>
					</div>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
				<Button
					onClick={updateTextAndSend}
					color="primary"
					autoFocus
					disabled={isEmptyString(text)}
				>
					{t('Send')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default SendInteractiveMessageDialog;
