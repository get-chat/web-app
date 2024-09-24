// @ts-nocheck
import React, { useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Button, Dialog, IconButton, Tooltip } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import { useTranslation } from 'react-i18next';
import VoiceRecord from '@src/components/ChatFooter/VoiceRecord';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_REQUEST_MIC_PERMISSION } from '../Constants';
import MicIcon from '@mui/icons-material/Mic';
import '../styles/SendBulkVoiceMessageDialog.css';
import { prepareSendFilePayload } from '../helpers/ChatHelper';
import Alert from '@mui/material/Alert';
import { AxiosError, AxiosResponse } from 'axios';
import { useAppDispatch } from '@src/store/hooks';
import { setSelectionModeEnabled } from '@src/store/reducers/UIReducer';

const SendBulkVoiceMessageDialog = ({
	apiService,
	open,
	setOpen,
	setUploadingMedia,
	setBulkSendPayload,
}) => {
	// TODO: Handle isRecording globally to avoid conflicts
	const [isRecording, setRecording] = useState(false);

	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const close = () => {
		setOpen(false);
	};

	const sendHandledChosenFiles = (preparedFiles) => {
		console.log(preparedFiles);

		if (preparedFiles) {
			// Prepare and queue uploading and sending processes
			Object.entries(preparedFiles).forEach((curFile) => {
				const curChosenFile = curFile[1];
				const file = curChosenFile.file;

				const formData = new FormData();
				formData.append('file_encoded', file);

				uploadMedia(curChosenFile, {}, formData, null);
			});
		}
	};

	const uploadMedia = (chosenFile, payload, formData, completeCallback) => {
		// To display a progress
		setUploadingMedia(true);

		apiService.uploadMediaCall(
			formData,
			(response: AxiosResponse) => {
				// Convert parameters to a ChosenFile object
				sendFile(
					payload?.wa_id,
					response.data.file,
					chosenFile,
					undefined,
					function () {
						completeCallback?.();
						setUploadingMedia(false);
					}
				);
			},
			(error: AxiosError) => {
				console.log(error);

				// A retry can be considered
				completeCallback?.();
				setUploadingMedia(false);
			}
		);
	};

	const sendFile = (
		receiverWaId,
		fileURL,
		chosenFile,
		customPayload,
		completeCallback
	) => {
		completeCallback?.();

		const requestBody = prepareSendFilePayload(chosenFile, fileURL);
		setBulkSendPayload(requestBody);

		dispatch(setSelectionModeEnabled(true));

		// Hide the dialog
		setOpen(false);
	};

	return (
		<Dialog open={open} onClose={close} className="sendBulkVoiceMessageDialog">
			<DialogTitle>{t('Send bulk voice message')}</DialogTitle>
			<DialogContent className="sendBulkVoiceMessageDialogContent">
				<Alert severity="info">
					{t(
						'You can only send voice messages to users who wrote to you in last 24h.'
					)}
				</Alert>

				{!isRecording && (
					<>
						<h4>{t('Click to record your message')}</h4>
						<Tooltip
							title={t('Click to record your message')}
							placement="bottom"
							disableInteractive
						>
							<IconButton
								onClick={() =>
									PubSub.publish(EVENT_TOPIC_REQUEST_MIC_PERMISSION, 'bulk')
								}
								size="large"
							>
								<MicIcon />
							</IconButton>
						</Tooltip>
					</>
				)}

				<div className={!isRecording ? 'hidden' : ''}>
					<VoiceRecord
						voiceRecordCase="bulk"
						setRecording={setRecording}
						sendHandledChosenFiles={sendHandledChosenFiles}
					/>
				</div>
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary" disabled={isRecording}>
					{t('Close')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default SendBulkVoiceMessageDialog;
