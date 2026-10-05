import React, { useEffect, useRef, useState } from 'react';
import CloseIcon from '@src/components/icons/Close';
import FiberManualRecordIcon from '@src/components/icons/FiberManualRecord';
import { displaySeconds } from '@src/helpers/Helpers';
import DoneIcon from '@src/components/icons/Check';
import VoiceRecorder from '../../VoiceRecorder';
import {
	EVENT_TOPIC_DISPLAY_ERROR,
	EVENT_TOPIC_REQUEST_MIC_PERMISSION,
	EVENT_TOPIC_VOICE_RECORD_STARTING,
} from '@src/Constants';
import PubSub from 'pubsub-js';
import { useParams } from 'react-router-dom';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';
import { SimpleTooltip } from '@src/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import ChosenFileList from '@src/interfaces/ChosenFileList';
import * as Styled from './VoiceRecord.styles';

interface Props {
	voiceRecordCase: 'chat';
	setRecording: (value: boolean) => void;
	sendHandledChosenFiles: (data: ChosenFileList) => void;
}

let timerIntervalId: ReturnType<typeof setInterval>;

const VoiceRecord: React.FC<Props> = ({
	voiceRecordCase,
	setRecording,
	sendHandledChosenFiles,
}) => {
	const { t } = useTranslation();

	const voiceRecorder = useRef<VoiceRecorder>(new VoiceRecorder());
	const [timer, setTimer] = useState(0);

	const { waId } = useParams();

	const [open, setOpen] = useState(false);

	const handleClose = () => {
		setOpen(false);
	};

	useEffect(() => {
		const onRequestMicPermission = function (msg: string, data: any) {
			if (data === voiceRecordCase) {
				PubSub.publish(EVENT_TOPIC_VOICE_RECORD_STARTING, voiceRecordCase);
				requestMicrophonePermission();
			}
		};

		const onRequestMicPermissionToken = PubSub.subscribe(
			EVENT_TOPIC_REQUEST_MIC_PERMISSION,
			onRequestMicPermission
		);

		const onVoiceRecordStarting = function (msg: string, data: any) {
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
					console.log(err);

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

	const startVoiceRecord = (stream: MediaStream) => {
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
			function (audioFile: any) {
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
					0: chosenFile,
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
		<Styled.Container>
			<SimpleTooltip title={t('Cancel')} side="top" disableHoverableContent>
				<Styled.CancelButton onClick={stopVoiceRecord}>
					<CloseIcon />
				</Styled.CancelButton>
			</SimpleTooltip>

			<Styled.RecordIcon />
			<Styled.Timer>{displaySeconds(timer)}</Styled.Timer>

			<SimpleTooltip title={t('Send')} side="top" disableHoverableContent>
				<Styled.SendButton onClick={sendVoiceRecord}>
					<DoneIcon />
				</Styled.SendButton>
			</SimpleTooltip>

			<Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('Oops!')}</DialogTitle>
					</DialogHeader>
					<DialogBody>
						<DialogDescription>
							{t(
								'You must open the inbox in a new tab to access this feature.'
							)}
						</DialogDescription>
					</DialogBody>
					<DialogFooter>
						<Button variant="ghost" color="secondary" onClick={handleClose}>
							{t('Close')}
						</Button>
						<Button
							variant="ghost"
							color="primary"
							onClick={goToInbox}
							autoFocus
						>
							{t('Go to inbox')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Styled.Container>
	);
};

export default VoiceRecord;
