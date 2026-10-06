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
import { cn } from '@src/lib/utils';

// MUI's small IconButton (5px padding) around a 20px icon: a 30px circle
const actionClassName =
	'size-7.5 rounded-full bg-transparent focus-visible:bg-transparent [&_.app-icon]:size-5!';

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
		<div className="flex items-center justify-between rounded-[20px] bg-white shadow-[0_4px_5px_-6px_rgba(0,0,45,0.4)]">
			<SimpleTooltip title={t('Cancel')} side="top" disableHoverableContent>
				<Button
					variant="ghost"
					color="neutral"
					size="icon-sm"
					className={cn(
						actionClassName,
						'mr-5 hover:bg-[rgba(255,0,0,0.2)] max-md:mr-2.5 [&_.app-icon]:text-[red]!'
					)}
					onClick={stopVoiceRecord}
				>
					<CloseIcon />
				</Button>
			</SimpleTooltip>

			<FiberManualRecordIcon className="mr-0.5 animate-blink text-[red]!" />
			<span className="mr-5 min-w-12 text-center text-[14px] font-semibold text-ink/82 max-md:mr-2.5">
				{displaySeconds(timer)}
			</span>

			<SimpleTooltip title={t('Send')} side="top" disableHoverableContent>
				<Button
					variant="ghost"
					color="neutral"
					size="icon-sm"
					className={cn(
						actionClassName,
						'hover:bg-[rgba(0,255,0,0.2)] [&_.app-icon]:text-[green]!'
					)}
					onClick={sendVoiceRecord}
				>
					<DoneIcon />
				</Button>
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
		</div>
	);
};

export default VoiceRecord;
