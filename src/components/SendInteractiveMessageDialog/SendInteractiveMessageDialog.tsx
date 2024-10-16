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
	const [messageData, setMessageData] = useState<ChatMessageModel | null>(null);

	useEffect(() => {
		if (describedInteractive) {
			const clone = { ...describedInteractive.payload };
			clone.body.text = text;

			setMessageData(ChatMessageModel.fromInteractive(clone));
		}
	}, [text, describedInteractive]);

	const { t } = useTranslation();

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
							<div className={styles.textFieldWrapper}>
								<TextField
									variant="standard"
									value={text}
									onChange={(e) => setText(e.target.value)}
									label={t('Enter your message here')}
									size="medium"
									multiline={true}
									fullWidth={true}
								/>
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
