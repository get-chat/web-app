class VoiceRecorder {

    constructor() {
        this.mediaRecorder = null;
    }

    start(stream, startCallback, stopCallback) {
        this.mediaRecorder = new MediaRecorder(stream);

        let chunks = [];

        this.mediaRecorder.ondataavailable = function (event) {
            chunks.push(event.data);
        }

        this.mediaRecorder.onstart = function (e) {
            if (startCallback) {
                startCallback();
            }
        }

        this.mediaRecorder.onstop = function (e) {
            const blob = new Blob(chunks, {'type': 'audio/ogg; codecs=opus'});
            chunks = [];
            const audioURL = URL.createObjectURL(blob);

            stream.getTracks().forEach(track => track.stop());

            if (stopCallback) {
                stopCallback(audioURL);
            }
        }

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