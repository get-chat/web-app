import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Button, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './SendInteractiveMessageDialog.module.css';
import { isEmptyString } from '@src/helpers/Helpers';

export type Props = {
	isVisible: boolean;
	setVisible: (visible: boolean) => void;
	interactiveMessage?: any;
	onSend: (interactiveMessage: any) => void;
};

const SendInteractiveMessageDialog: React.FC<Props> = ({
	isVisible,
	setVisible,
	interactiveMessage,
	onSend,
}) => {
	const [text, setText] = useState('');

	const { t } = useTranslation();

	const close = () => {
		setVisible(false);
	};

	const updateTextAndSend = () => {
		if (interactiveMessage) {
			const clone = { ...interactiveMessage };
			clone.body.text = text;
			onSend(clone);
		}

		close();
	};

	return (
		<Dialog open={isVisible} onClose={close}>
			<DialogTitle>{t('Send an interactive message')}</DialogTitle>
			<DialogContent>
				{interactiveMessage && (
					<>
						<h4>{interactiveMessage.type}</h4>

						{Object.entries(interactiveMessage)
							.filter((entry) => entry[0] !== 'type')
							.map((entry) => (
								<div className={styles.section}>
									<h6 className={styles.sectionTitle}>
										{entry[0]?.toUpperCase()}
									</h6>
									<div>{JSON.stringify(entry[1])}</div>
								</div>
							))}

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
					</>
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
