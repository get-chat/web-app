import {BASE_URL} from "./Constants";

export class ChatMessageClass {

    constructor(data, contactName) {
        const payload = data.waba_payload;

        this.id = payload.id;
        this.to = payload.to;
        this.waId = data.customer_wa_id;
        this.type = payload.type;
        this.senderObject = data.sender;
        this.username = data.sender?.username;
        this.senderName = this.username ?? (!this.isFromUs ? contactName : "Us");
        this.initials = this.senderName ? this.senderName[0] : "?";
        this.isFromUs = data.from_us;
        this.text = payload.text?.body;
        this.timestamp = payload.timestamp;
        this.isSeen = data.seen;
        this.imageId = payload.image?.id;
        this.imageLink = payload.image?.link;
        this.videoId = payload.video?.id;
        this.videoLink = payload.video?.link;
        this.documentId = payload.document?.id;
        this.documentLink = payload.document?.link;
        this.documentFileName = payload.document?.filename;
        this.documentCaption = payload.document?.caption;
        this.voiceId = payload.voice?.id;
        this.voiceLink = payload.voice?.link;
        this.audioId = payload.audio?.id;
        this.audioLink = payload.audio?.link;
        this.stickerId = payload.sticker?.id;
        this.stickerLink = payload.sticker?.stickerLink;
        this.caption = payload.image?.caption ?? payload.video?.caption ?? payload.audio?.caption;
        this.templateName = payload.template?.name;
        this.templateNamespace = payload.template?.namespace;
        this.templateLanguage = payload.template?.language?.code;
    };

    hasMediaToPreview() {
        return this.imageLink !== undefined || this.videoId !== undefined;
    }

    hasAnyAudio() {
        return this.voiceId !== undefined || this.voiceLink !== undefined || this.audioId !== undefined || this.audioLink !== undefined;
    }

    generateMediaLink(id) {
        return `${BASE_URL}media/${id}`;
    }

    generateImageLink() {
        return this.imageLink ?? this.generateMediaLink(this.imageId);
    }

    generateVideoLink() {
        return this.videoLink ?? this.generateMediaLink(this.videoId);
    }

    generateDocumentLink() {
        return this.documentLink ?? this.generateMediaLink(this.documentId);
    }

    generateVoiceLink() {
        return this.voiceLink ?? this.generateMediaLink(this.voiceId);
    }

    generateAudioLink() {
        return this.audioLink ?? this.generateMediaLink(this.audioId);
    }

    generateStickerLink() {
        return this.stickerLink ?? this.generateMediaLink(this.stickerId);
    }
}

export default ChatMessageClass;