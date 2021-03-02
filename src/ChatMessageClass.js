import {BASE_URL} from "./Constants";

export class ChatMessageClass {

    static TYPE_TEXT = 'text';
    static TYPE_IMAGE = 'image';
    static TYPE_VIDEO = 'video';
    static TYPE_VOICE = 'voice';
    static TYPE_AUDIO = 'audio';
    static TYPE_DOCUMENT = 'document';
    static TYPE_STICKER = 'sticker';
    static TYPE_TEMPLATE = 'template';

    static STATUS_SENT = 'sent';
    static STATUS_DELIVERED = 'delivered';
    static STATUS_READ = 'read';

    constructor(data) {
        const payload = data.waba_payload;
        const statuses = data.waba_statuses;

        // Temp
        this.payload = payload;

        this.id = payload.id;
        this.to = payload.to;
        this.waId = data.customer_wa_id;
        this.senderWaId = payload.from;
        this.isFromUs = data.from_us;
        this.contact = data.contact;
        this.type = payload.type;
        this.senderObject = data.sender;
        this.username = data.sender?.username;
        this.senderName = this.getSenderName();
        this.initials = this.senderName ? this.senderName[0] : "?";
        this.text = payload.text?.body;
        this.timestamp = payload.timestamp ? parseInt(payload.timestamp) : -1;
        this.isSeen = data.seen;

        this.imageId = payload.image?.id;
        this.imageLink = payload.image?.link ?? (this.imageId ? this.generateImageLink() : undefined);

        this.videoId = payload.video?.id;
        this.videoLink = payload.video?.link ?? (this.videoId ? this.generateVideoLink() : undefined);

        this.documentId = payload.document?.id;
        this.documentLink = payload.document?.link ?? (this.documentId ? this.generateDocumentLink() : undefined);
        this.documentFileName = payload.document?.filename;
        //this.documentCaption = payload.document?.caption;

        this.voiceId = payload.voice?.id;
        this.voiceLink = payload.voice?.link ?? (this.voiceId ? this.generateVoiceLink() : undefined);

        this.audioId = payload.audio?.id;
        this.audioLink = payload.audio?.link ?? (this.audioId ? this.generateAudioLink() : undefined);

        this.stickerId = payload.sticker?.id;
        this.stickerLink = payload.sticker?.stickerLink ?? (this.stickerId ? this.generateStickerLink() : undefined);

        this.caption = payload.image?.caption ?? payload.video?.caption ?? payload.audio?.caption ?? payload.document?.caption;

        this.templateName = payload.template?.name;
        this.templateNamespace = payload.template?.namespace;
        this.templateLanguage = payload.template?.language?.code;

        this.contextFrom = payload.context?.from;
        this.contextId = payload.context?.id;

        this.deliveredTimestamp = statuses.delivered;
        this.readTimestamp = statuses.read;
        this.sentTimestamp = statuses.sent;
    };

    getUniqueSender() {
        return this.username ?? this.senderWaId;
    }

    getSenderName() {
        if (this.senderObject) {
            const firstName = this.senderObject.first_name;
            const lastName = this.senderObject.last_name;

            if (firstName || lastName) {
                return firstName + (lastName ? ' ' + lastName : '');
            } else {
                return this.username;
            }
        }

        return this.senderObject?.username ?? (!this.isFromUs ? this.contact?.waba_payload?.profile?.name : "Us");
    }

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

    getStatus() {
        if (this.deliveredTimestamp) {
            if (this.readTimestamp && this.readTimestamp > this.deliveredTimestamp) {
                return ChatMessageClass.STATUS_READ;
            }

            return ChatMessageClass.STATUS_DELIVERED;
        }

        // We don't check if sent timestamp exists, this might be null right after sending message to bridge API
        return ChatMessageClass.STATUS_SENT;
    }

    isDelivered() {
        return this.getStatus() === ChatMessageClass.STATUS_DELIVERED;
    }

    isRead() {
        return this.getStatus() === ChatMessageClass.STATUS_READ;
    }

    isDeliveredOrRead() {
        const status = this.getStatus();
        return status === ChatMessageClass.STATUS_DELIVERED || status === ChatMessageClass.STATUS_READ;
    }
}

export default ChatMessageClass;