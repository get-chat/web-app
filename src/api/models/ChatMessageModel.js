import TextHelper from '../../helpers/TextHelper';
import GenericHelper from '../../helpers/GenericHelper';
import moment from 'moment';

export class ChatMessageModel {
	static TYPE_TEXT = 'text';
	static TYPE_IMAGE = 'image';
	static TYPE_VIDEO = 'video';
	static TYPE_VOICE = 'voice';
	static TYPE_AUDIO = 'audio';
	static TYPE_DOCUMENT = 'document';
	static TYPE_STICKER = 'sticker';
	static TYPE_LOCATION = 'location';
	static TYPE_TEMPLATE = 'template';
	static TYPE_BUTTON = 'button';
	static TYPE_INTERACTIVE = 'interactive';

	static STATUS_SENT = 'sent';
	static STATUS_DELIVERED = 'delivered';
	static STATUS_READ = 'read';

	constructor(data) {
		if (!data) {
			return;
		}

		const payload = data.waba_payload;
		const statuses = data.waba_statuses;

		// Temp
		this.payload = payload;

		this.id = payload.id;
		this.getchatId = data.id;
		this.to = payload.to;
		this.waId = data.customer_wa_id;
		this.isFromUs = data.from_us;
		this.senderWaId = payload.from;
		this.contact = data.contact;
		this.type = payload.type;
		this.senderObject = data.sender;
		this.username = data.sender?.username;
		this.senderName = this.getSenderName();
		this.initials = this.generateInitials(); //this.senderName ? this.senderName[0] : "?";
		this.text = payload.text?.body;
		this.buttonText = payload.button?.text;
		this.interactiveButtonText = payload.interactive?.button_reply?.title;
		this.timestamp = payload.timestamp ? parseInt(payload.timestamp) : -1;
		//this.isReceived = data.received;

		this.imageId = payload.image?.id;
		this.imageLink =
			payload.image?.link ??
			(this.imageId ? this.generateImageLink() : undefined);

		this.videoId = payload.video?.id;
		this.videoLink =
			payload.video?.link ??
			(this.videoId ? this.generateVideoLink() : undefined);

		this.documentId = payload.document?.id;
		this.documentLink =
			payload.document?.link ??
			(this.documentId ? this.generateDocumentLink() : undefined);
		this.documentFileName = payload.document?.filename;
		//this.documentCaption = payload.document?.caption;

		this.voiceId = payload.voice?.id;
		this.voiceLink =
			payload.voice?.link ??
			(this.voiceId ? this.generateVoiceLink() : undefined);

		this.audioId = payload.audio?.id;
		this.audioLink =
			payload.audio?.link ??
			(this.audioId ? this.generateAudioLink() : undefined);

		this.stickerId = payload.sticker?.id;
		this.stickerLink =
			payload.sticker?.stickerLink ??
			(this.stickerId ? this.generateStickerLink() : undefined);

		this.caption =
			payload.image?.caption ??
			payload.video?.caption ??
			payload.audio?.caption ??
			payload.document?.caption;

		this.mimeType =
			payload.image?.mime_type ??
			payload.video?.mime_type ??
			payload.audio?.mime_type ??
			payload.document?.mime_type;

		this.location = payload.location;

		this.templateName = payload.template?.name;
		this.templateNamespace = payload.template?.namespace;
		this.templateLanguage = payload.template?.language?.code;
		this.templateParameters = payload.template?.components;

		this.interactive = payload.interactive;

		this.isForwarded = payload.context?.forwarded ?? false;

		this.contextFrom = payload.context?.from;
		this.contextId = payload.context?.id;

		if (data.context) {
			this.contextMessage = new ChatMessageModel(data.context);
		}

		this.deliveredTimestamp = statuses.delivered;
		this.readTimestamp = statuses.read;
		this.sentTimestamp = statuses.sent;

		this.errors = payload.errors;
		this.isStored = false;
		this.isFailed = false;
		this.resendPayload = undefined;

		this.sanitize();
	}

	sanitize() {
		this.text = TextHelper.sanitize(this.text);
		this.caption = TextHelper.sanitize(this.caption);
	}

	textLength() {
		return (this.text ?? this.buttonText ?? this.interactiveButtonText ?? '')
			.length;
	}

	static fromAssignmentEvent(assignmentEvent) {
		const message = new ChatMessageModel();
		message.id = 'assignmentEvent_' + assignmentEvent.timestamp;
		message.waId = assignmentEvent.wa_id;
		message.assignmentEvent = assignmentEvent;
		message.timestamp = assignmentEvent.timestamp;
		return message;
	}

	static fromTaggingEvent(taggingEvent) {
		const message = new ChatMessageModel();
		message.id = 'taggingEvent_' + taggingEvent.timestamp;
		message.waId = taggingEvent.chat;
		message.taggingEvent = taggingEvent;
		message.timestamp = taggingEvent.timestamp;
		return message;
	}

	static generateInternalIdStringStatic(getchatId) {
		return 'getchatId_' + getchatId;
	}

	generateInternalIdString() {
		return ChatMessageModel.generateInternalIdStringStatic(this.getchatId);
	}

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

		return (
			this.senderObject?.username ??
			(!this.isFromUs ? this.contact?.waba_payload?.profile?.name : 'Us')
		);
	}

	generateInitials = () => {
		return GenericHelper.generateInitialsHelper(this.senderName);
	};

	hasMediaToPreview() {
		return (
			this.imageLink !== undefined ||
			this.videoId !== undefined ||
			this.getHeaderFileLink('image') ||
			this.getHeaderFileLink('video')
		);
	}

	hasAnyAudio() {
		return (
			this.voiceId !== undefined ||
			this.voiceLink !== undefined ||
			this.audioId !== undefined ||
			this.audioLink !== undefined
		);
	}

	generateMediaLink(id) {
		return id ? `${window.apiService.apiBaseURL}media/${id}` : undefined;
	}

	generateImageLink(includeTemplateHeader) {
		return (
			this.imageLink ??
			this.generateMediaLink(this.imageId) ??
			(includeTemplateHeader === true
				? this.getHeaderFileLink('image')
				: undefined)
		);
	}

	generateVideoLink(includeTemplateHeader) {
		return (
			this.videoLink ??
			this.generateMediaLink(this.videoId) ??
			(includeTemplateHeader === true
				? this.getHeaderFileLink('video')
				: undefined)
		);
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

	generateLocationURL() {
		return `https://www.google.com/maps/search/?api=1&query=${this.location?.latitude},${this.location?.longitude}`;
	}

	getStatus() {
		if (this.readTimestamp) {
			return ChatMessageModel.STATUS_READ;
		}

		if (this.deliveredTimestamp) {
			return ChatMessageModel.STATUS_DELIVERED;
		}

		// We don't check if sent timestamp exists, this might be null right after sending message to bridge api
		return ChatMessageModel.STATUS_SENT;
	}

	isDelivered() {
		return this.getStatus() === ChatMessageModel.STATUS_DELIVERED;
	}

	isRead() {
		return this.getStatus() === ChatMessageModel.STATUS_READ;
	}

	isDeliveredOrRead() {
		const status = this.getStatus();
		return (
			status === ChatMessageModel.STATUS_DELIVERED ||
			status === ChatMessageModel.STATUS_READ
		);
	}

	getHeaderFileLink(type) {
		if (this.type === ChatMessageModel.TYPE_TEMPLATE) {
			if (this.templateParameters) {
				for (let i = 0; i < this.templateParameters.length; i++) {
					const component = this.templateParameters[i];

					if (component.type === 'header') {
						for (let j = 0; j < component.parameters.length; j++) {
							const param = component.parameters[j];

							if (param.type === type) {
								return param[type]?.link;
							}
						}
					}
				}
			}
		}

		return undefined;
	}

	isDateIndicatorVisible(previousMessage) {
		const curMsgDate = moment.unix(this.timestamp);
		let previousMsgDate;

		if (previousMessage) {
			previousMsgDate = moment.unix(previousMessage.timestamp);
		}

		return !previousMessage || !curMsgDate.isSame(previousMsgDate, 'day');
	}

	isSenderVisible(previousMessage) {
		if (previousMessage) {
			if (this.getUniqueSender() === previousMessage.getUniqueSender()) {
				return false;
			}
		}

		return true;
	}
}

export default ChatMessageModel;
