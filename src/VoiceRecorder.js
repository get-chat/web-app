import ChosenFileClass from './ChosenFileClass';
import { ATTACHMENT_TYPE_AUDIO } from './Constants';
import { Mp3MediaRecorder } from 'mp3-mediarecorder';

class VoiceRecorder {
	constructor() {
		this.mediaRecorder = undefined;
		this.lastAudioChosenFile = undefined;
	}

	start(stream, startCallback, stopCallback, dataAvailableCallback) {
		// Clear previous audio url if exists
		this.lastAudioChosenFile = undefined;

		// Create a media recorder with given stream
		this.mediaRecorder = new Mp3MediaRecorder(
			stream, // MediaStream instance
			{ worker: new Worker(new URL('./recorder/worker', import.meta.url)) }
		);

		this.mediaRecorder.onstart = () => {
			if (startCallback) {
				startCallback();
			}
		};

		const _this = this;
		this.mediaRecorder.ondataavailable = (event) => {
			const blob = event.data;

			const file = new File([blob], 'voice', { type: blob.type });
			const chosenFile = new ChosenFileClass(0, file);

			// Override type without async codec check
			chosenFile.attachmentType = ATTACHMENT_TYPE_AUDIO;

			_this.lastAudioChosenFile = chosenFile;

			if (dataAvailableCallback) {
				dataAvailableCallback();
			}
		};

		this.mediaRecorder.onstop = () => {
			stream.getTracks().forEach((track) => track.stop());

			if (stopCallback) {
				stopCallback();
			}
		};

		// Start recording
		this.mediaRecorder.start();
	}

	stop() {
		this.mediaRecorder.stop();
	}

	cancel() {
		if (this.mediaRecorder) {
			this.mediaRecorder.onstart = undefined;
			this.mediaRecorder.ondataavailable = undefined;
			this.mediaRecorder.onstop = undefined;

			if (this.isRecording()) {
				const stream = this.mediaRecorder.stream;
				this.mediaRecorder.stop();

				stream.getTracks().forEach((track) => track.stop());
			}
		}
	}

	getState() {
		return this.mediaRecorder?.state;
	}

	isRecording() {
		return this.getState() === 'recording';
	}
}

export default VoiceRecorder;
