class VoiceRecorder {

    constructor() {
        this.mediaRecorder = undefined;
        this.lastAudioURL = undefined;
    }

    start(stream, startCallback, stopCallback) {
        // Clear previous audio url if exists
        this.lastAudioURL = undefined;

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
            const blob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'});
            chunks = [];
            const audioURL = URL.createObjectURL(blob);

            _this.lastAudioURL = audioURL;

            stream.getTracks().forEach(track => track.stop());

            if (stopCallback) {
                stopCallback(audioURL);
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