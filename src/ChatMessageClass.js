import {BASE_URL} from "./Constants";

export class ChatMessageClass {

    constructor(data, contactName) {
        const payload = data.waba_payload;

        this.id = payload.id;
        this.to = payload.to;
        this.waId = data.customer_wa_id;
        this.senderObject = data.sender;
        this.username = data.sender?.username;
        this.senderName = this.username ?? (!this.isFromUs ? contactName : "Us");
        this.initials = this.senderName ? this.senderName[0] : "?";
        this.isFromUs = data.from_us;
        this.text = payload.text?.body;
        this.timestamp = payload.timestamp;
        this.isSeen = data.seen;
        this.imageLink = payload.image?.link;
        this.videoId = payload.video?.id;
        this.voiceId = payload.voice?.id;
        this.audioId = payload.audio?.id;
        this.caption = payload.image?.caption ?? payload.video?.caption;
    };

    hasMediaToPreview() {
        return this.imageLink !== undefined || this.videoId !== undefined;
    }

    hasAnyAudio() {
        return this.voiceId !== undefined || this.audioId !== undefined;
    }

    generateMediaLink(id) {
        return `${BASE_URL}media/${id}`;
    }

    generateVideoLink() {
        return this.generateMediaLink(this.videoId);
    }

    generateVoiceLink() {
        return this.generateMediaLink(this.voiceId);
    }

    generateAudioLink() {
        return this.generateMediaLink(this.audioId);
    }
}

export default ChatMessageClass;