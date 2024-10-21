import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Button, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './SendInteractiveMessageDialog.module.css';
import ChatMessage from '@src/components/Main/Chat/ChatMessage/ChatMessage';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { DescribedInteractive } from '@src/components/InteractiveMessageList/InteractiveMessageList';
import { isEmptyString } from '@src/helpers/Helpers';

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
	const [payload, setPayload] = useState({});
	const [messageData, setMessageData] = useState<ChatMessageModel | null>(null);
	const [isShowErrors, setIsShowErrors] = useState(false);

	const { t } = useTranslation();

	useEffect(() => {
		if (isVisible) {
			setPayload(
				describedInteractive?.payload ? { ...describedInteractive.payload } : {}
			);
			setIsShowErrors(false);
		}
	}, [isVisible, describedInteractive]);

	useEffect(() => {
		if (payload) {
			setMessageData(ChatMessageModel.fromInteractive({ ...payload }));
		}
	}, [payload]);

	const close = () => {
		setVisible(false);
	};

	const checkAndSend = () => {
		if (!isFormValid()) {
			setIsShowErrors(true);
			return;
		}

		onSend(payload);
		close();
	};

	function keyToLabel(str?: string | null): string {
		if (!str) {
			return '';
		}

		const replacedStr = str.replace(/[._]/g, ' '); // Replace dots and underscores with spaces
		return replacedStr.charAt(0).toUpperCase() + replacedStr.slice(1);
	}

	function getNestedValue(obj: any, path: string) {
		return path.split('.').reduce((acc, key) => acc && acc[key], obj);
	}

	function setNestedValue(obj: any, path: string, value: any) {
		const keys = path.split('.');
		const lastKey = keys.pop(); // Get the last key (e.g., 'display_text')

		const cloneObj = JSON.parse(JSON.stringify(obj));

		// Traverse the object to the second-to-last key
		const nestedObj = keys.reduce((acc, key) => acc && acc[key], cloneObj);

		if (nestedObj && lastKey) {
			nestedObj[lastKey] = value; // Set the new value
		}

		return cloneObj;
	}

	const isFormValid = () => {
		let isValid = true;

		describedInteractive?.parameters.forEach((parameter) => {
			if (
				parameter.required &&
				isEmptyString(getNestedValue(payload, parameter.key))
			) {
				isValid = false;
			}
		});

		return isValid;
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
							<div>
								{payload &&
									describedInteractive.parameters.map((parameter) => (
										<div
											className={styles.textFieldWrapper}
											key={parameter.key}
										>
											<TextField
												variant="standard"
												value={getNestedValue(payload, parameter.key)}
												onChange={(e) =>
													setPayload((prevState) =>
														setNestedValue(
															prevState,
															parameter.key,
															e.target.value
														)
													)
												}
												label={t(
													parameter.description || keyToLabel(parameter.key)
												)}
												size="medium"
												multiline={true}
												fullWidth={true}
												required={parameter.required}
												error={
													isShowErrors && parameter.required
														? isEmptyString(
																getNestedValue(payload, parameter.key) ?? ''
														  )
														: false
												}
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
				<Button onClick={checkAndSend} color="primary" autoFocus>
					{t('Send')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default SendInteractiveMessageDialog;
