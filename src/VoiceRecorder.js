import ChosenFileClass from "./ChosenFileClass";
import {ATTACHMENT_TYPE_AUDIO} from "./Constants";

class VoiceRecorder {

    constructor() {
        this.mediaRecorder = undefined;
        this.lastAudioChosenFile = undefined;
        this.willConvert = false;
    }

    start(stream, startCallback, stopCallback) {
        // Clear previous audio url if exists
        this.lastAudioChosenFile = undefined;

        // Create a media recorder with given stream
        this.mediaRecorder = new MediaRecorder(stream);

        let chunks = [];
        this.mediaRecorder.ondataavailable = function (event) {
            chunks.push(event.data);
        }

        this.mediaRecorder.onstart = function (event) {
            if (startCallback) {
                startCallback();
            }
        }

        const _this = this;

        this.mediaRecorder.onstop = function (event) {
            let contentType = 'audio/ogg; codecs=opus';

            if (!MediaRecorder.isTypeSupported(contentType)) {
                contentType = 'audio/webm';
                _this.willConvert = true;
            }

            const blob = new Blob(chunks, { 'type': contentType });
            chunks = [];

            const file = new File([blob], 'voice', { type: blob.type });
            const chosenFile = new ChosenFileClass(0, file);

            // Override type without async codec check
            chosenFile.attachmentType = ATTACHMENT_TYPE_AUDIO;

            _this.lastAudioChosenFile = chosenFile;

            stream.getTracks().forEach(track => track.stop());

            if (stopCallback) {
                stopCallback(file);
            }
        }

        // Start recording
        this.mediaRecorder.start();
    }

    stop() {
        this.mediaRecorder.stop();
    }

    getState() {
        return this.mediaRecorder?.state;
    }

    isRecording() {
        return this.getState() === 'recording';
    }
}

export default VoiceRecorder;