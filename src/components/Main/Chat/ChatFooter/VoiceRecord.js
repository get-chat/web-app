import React, { useEffect, useRef, useState } from 'react';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { displaySeconds } from '../../../../helpers/Helpers';
import DoneIcon from '@mui/icons-material/Done';
import '../../../../styles/VoiceRecord.css';
import VoiceRecorder from '../../../../VoiceRecorder';
import {
	EVENT_TOPIC_DISPLAY_ERROR,
	EVENT_TOPIC_REQUEST_MIC_PERMISSION,
	EVENT_TOPIC_VOICE_RECORD_STARTING,
} from '../../../../Constants';
import PubSub from 'pubsub-js';
import { useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

let timerIntervalId;

function VoiceRecord({
	voiceRecordCase,
	setRecording,
	sendHandledChosenFiles,
}) {
	const { t } = useTranslation();

	const voiceRecorder = useRef(new VoiceRecorder());
	const [timer, setTimer] = useState(0);

	const { waId } = useParams();

	const [open, setOpen] = React.useState(false);

	const handleClose = () => {
		setOpen(false);
	};

	useEffect(() => {
		const onRequestMicPermission = function (msg, data) {
			if (data === voiceRecordCase) {
				PubSub.publish(EVENT_TOPIC_VOICE_RECORD_STARTING, voiceRecordCase);
				requestMicrophonePermission();
			}
		};

		const onRequestMicPermissionToken = PubSub.subscribe(
			EVENT_TOPIC_REQUEST_MIC_PERMISSION,
			onRequestMicPermission
		);

		const onVoiceRecordStarting = function (msg, data) {
			if (data !== voiceRecordCase) {
				cancelVoiceRecord();
			}
		};

		const onVoiceRecordStartingToken = PubSub.subscribe(
			EVENT_TOPIC_VOICE_RECORD_STARTING,
			onVoiceRecordStarting
		);

		return () => {
			PubSub.unsubscribe(onRequestMicPermissionToken);
			PubSub.unsubscribe(onVoiceRecordStartingToken);

			cancelVoiceRecord();
		};
	}, []);

	useEffect(() => {
		cancelVoiceRecord();
	}, [waId]);

	const cancelVoiceRecord = () => {
		voiceRecorder.current?.cancel();

		onVoiceRecordStop();
	};

	const onVoiceRecordStop = () => {
		setRecording(false);

		// Stop timer
		clearInterval(timerIntervalId);
		setTimer(0);
	};

	const requestMicrophonePermission = () => {
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			const constraints = {
				audio: {
					sampleRate: 48000,
					channelCount: 1,
					volume: 1.0,
					noiseSuppression: true,
				},
				video: false,
			};

			navigator.mediaDevices
				.getUserMedia(constraints)
				.then(function (stream) {
					startVoiceRecord(stream);
				})
				.catch(function (err) {
					console.log('Permission denied');

					PubSub.publish(
						EVENT_TOPIC_DISPLAY_ERROR,
						'You must grant microphone permission.'
					);

					if (window.AndroidWebInterface) {
						window.AndroidWebInterface.requestPermissions();
					}

					// Check if iframe
					if (window.self !== window.top) {
						setOpen(true);
					}
				});
		} else {
			console.log('Not supported on your browser.');

			PubSub.publish(
				EVENT_TOPIC_DISPLAY_ERROR,
				'This feature is not supported on your browser.'
			);
		}
	};

	const startVoiceRecord = (stream) => {
		// If it is already recording, return
		if (voiceRecorder.current?.isRecording()) return;

		// Start recording
		voiceRecorder.current?.start(
			stream,
			function () {
				setRecording(true);

				// Update timer every second
				timerIntervalId = setInterval(function () {
					setTimer((prevState) => prevState + 1);
				}, 1000);
			},
			function () {
				onVoiceRecordStop();
			},
			function (audioFile) {
				//console.log(audioFile);
			}
		);
	};

	const stopVoiceRecord = () => {
		voiceRecorder.current?.stop();
	};

	const sendVoiceRecord = () => {
		stopVoiceRecord();

		setTimeout(function () {
			const chosenFile = voiceRecorder.current.lastAudioChosenFile;

			// Send
			if (chosenFile) {
				sendHandledChosenFiles({
					0: voiceRecorder.current.lastAudioChosenFile,
				});
			} else {
				console.log('Audio file is missing');
			}
		}, 1000);
	};

	const goToInbox = () => {
		window.open(window.location.href, '_blank');
		handleClose();
	};

	return (
		<div className="voiceRecord">
			<IconButton
				onClick={stopVoiceRecord}
				className="voiceRecord__cancelButton"
				size="large"
			>
				<CloseIcon />
			</IconButton>

			<FiberManualRecordIcon className="voiceRecord__recordIcon" />
			<span className="voiceRecord__timer">{displaySeconds(timer)}</span>

			<IconButton
				onClick={sendVoiceRecord}
				className="voiceRecord__sendButton"
				size="large"
			>
				<DoneIcon />
			</IconButton>

			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>Oops!</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{t('You must open the inbox in a new tab to access this feature.')}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="secondary">
						{t('Close')}
					</Button>
					<Button onClick={goToInbox} color="primary" autoFocus>
						{t('Go to inbox')}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}

export default VoiceRecord;
