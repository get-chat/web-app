class VoiceRecorder {

    constructor() {
        this.mediaRecorder = null;
    }

    start(stream) {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start();

        let chunks = [];

        this.mediaRecorder.ondataavailable = function(event) {
            chunks.push(event.data);
        }

        this.mediaRecorder.onstop = function(e) {
            const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
            chunks = [];
            const audioURL = window.URL.createObjectURL(blob);

            console.log(audioURL);
        }
    }

    stop() {
        this.mediaRecorder.stop();
    }
}

export default VoiceRecorder;