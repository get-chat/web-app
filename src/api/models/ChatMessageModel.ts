// @ts-nocheck
import {
	generateInitialsHelper,
	generateUniqueID,
	sanitize,
} from '@src/helpers/Helpers';
import { parseIntSafely } from '@src/helpers/IntegerHelper';
import TagModel from '@src/api/models/TagModel';

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
	static TYPE_ORDER = 'order';
	static TYPE_CONTACTS = 'contacts';
	static STATUS_PENDING = 'pending';
	static STATUS_SENT = 'sent';
	static STATUS_DELIVERED = 'delivered';
	static STATUS_READ = 'read';

	static ERR_CODES_FOR_RETRY = [
		400, 410, 429, 430, 432, 433, 470, 471, 500, 1000, 1005, 1011, 1015, 1016,
		1018, 1023, 1024, 1026, 1031,
	];

	public id: string;
	public waId: string;
	public type?: string | null;
	public payload: any;
	public isFromUs = false;
	public senderName?: string;
	public initials?: string;
	public timestamp = -1;
	public errors?: any[] = [];
	public isFailed = false;
	public location: any;
	public assignmentEvent: any;
	public taggingEvent: any;
	public templateName?: string | null;
	public text?: string | null;
	public caption?: string | null;
	public buttonText?: string | null;
	public interactiveButtonText?: string | null;
	public isForwarded: boolean;
	public contextMessage?: ChatMessageModel;
	public referral: any;
	public documentLink?: string;
	public documentFileName?: string;
	public documentCaption?: string;
	public readTimestamp?: number;
	public deliveredTimestamp?: number;
	public sentTimestamp?: number;

	constructor(data) {
		if (!data) return;

		const payload = data.waba_payload;
		const statuses = data.waba_statuses;

		this.payload = payload;

		if (!payload) return;

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
		this.referral = payload.referral;
		this.buttonText = payload.button?.text;
		this.interactiveButtonText = payload.interactive?.button_reply?.title;
		this.timestamp = parseIntSafely(payload.timestamp) ?? -1;
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

		this.template = payload.template;
		this.templateName = payload.template?.name;
		this.templateNamespace = payload.template?.namespace;
		this.templateLanguage = payload.template?.language?.code;
		this.templateParameters = payload.template?.components;

		this.isForwarded = payload.context?.forwarded ?? false;

		this.contextFrom = payload.context?.from;
		this.contextId = payload.context?.id;

		if (data.context) {
			this.contextMessage = new ChatMessageModel(data.context);
		}

		this.deliveredTimestamp = statuses?.delivered;
		this.readTimestamp = statuses?.read;
		this.sentTimestamp = statuses?.sent;

		this.errors = payload.errors;
		this.isStored = false;
		this.isFailed = this.errors?.length > 0;
		this.resendPayload = undefined;

		// Not need to sanitize this, because it is already sanitized
		// this.sanitize();
	}

	sanitize() {
		this.text = sanitize(this.text);
		this.caption = sanitize(this.caption);
	}

	static fromTemplate(template) {
		return new ChatMessageModel({
			from_us: true,
			waba_payload: {
				type: ChatMessageModel.TYPE_TEMPLATE,
				template: template,
				timestamp: new Date().getTime(),
			},
		});
	}

	static fromAssignmentEvent(assignmentEvent) {
		const message = new ChatMessageModel();
		message.id =
			'assignmentEvent_' + assignmentEvent.timestamp + '_' + generateUniqueID();
		message.waId = assignmentEvent.wa_id;
		message.assignmentEvent = assignmentEvent;
		message.timestamp = assignmentEvent.timestamp;
		return message;
	}

	static fromTaggingEvent(taggingEvent) {
		const message = new ChatMessageModel();
		message.id =
			'taggingEvent_' + taggingEvent.timestamp + '_' + generateUniqueID();
		message.waId = taggingEvent.chat;
		message.taggingEvent = taggingEvent;
		if (message.taggingEvent) {
			message.taggingEvent.tag = new TagModel(message.taggingEvent.tag);
		}
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
		return generateInitialsHelper(this.senderName);
	};

	hasMediaToPreview() {
		return (
			this.imageLink !== undefined ||
			this.videoLink !== undefined ||
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
		return id ? `${window.config.API_BASE_URL}media/${id}` : undefined;
	}

	generateImageLink(includeTemplateHeader = false) {
		return (
			this.imageLink ??
			this.generateMediaLink(this.imageId) ??
			(includeTemplateHeader ? this.getHeaderFileLink('image') : undefined)
		);
	}

	generateVideoLink(includeTemplateHeaderOrReferral = false) {
		return (
			this.videoLink ??
			this.generateMediaLink(this.videoId) ??
			(includeTemplateHeaderOrReferral
				? this.getHeaderFileLink('video') ?? this.generateReferralVideoLink()
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

	generateReferralImageLink() {
		if (this.referral?.image) {
			return (
				this.referral.image.link ??
				this.generateMediaLink(this.referral.image.id)
			);
		}
	}

	generateReferralVideoLink() {
		if (this.referral?.video) {
			return (
				this.referral.video.link ??
				this.generateMediaLink(this.referral.video.id)
			);
		}
	}

	getStatus() {
		if (this.readTimestamp) {
			return ChatMessageModel.STATUS_READ;
		}

		if (this.deliveredTimestamp) {
			return ChatMessageModel.STATUS_DELIVERED;
		}

		if (this.sentTimestamp) {
			return ChatMessageModel.STATUS_SENT;
		}

		return ChatMessageModel.STATUS_PENDING;
	}

	isPending() {
		return this.getStatus() === ChatMessageModel.STATUS_PENDING;
	}

	isJustSent() {
		return this.getStatus() === ChatMessageModel.STATUS_SENT;
	}

	isJustDelivered() {
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
		try {
			if (this.type === ChatMessageModel.TYPE_TEMPLATE) {
				if (this.templateParameters) {
					for (let i = 0; i < this.templateParameters.length; i++) {
						const component = this.templateParameters[i];

						if (
							component &&
							component.type === 'header' &&
							component.parameters.length
						) {
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
		} catch (error) {
			console.error(error);
		}

		return undefined;
	}

	canRetry() {
		let result = false;

		if (this.errors && Array.isArray(this.errors)) {
			for (let i = 0; i < this.errors.length; i++) {
				if (
					ChatMessageModel.ERR_CODES_FOR_RETRY.includes(this.errors[i]['code'])
				) {
					result = true;
					break;
				}
			}
		}

		return result;
	}
}

export default ChatMessageModel;
