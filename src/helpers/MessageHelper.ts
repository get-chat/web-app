import { replaceEmojis } from './EmojiHelper';
// @ts-ignore
import { sanitize } from 'dompurify';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import {
	ChatAssignment,
	ChatTagging,
	Message,
	MessageStatus,
	MessageType,
} from '@src/types/messages';
import { parseIntSafely } from '@src/helpers/IntegerHelper';
import ReactionList from '@src/interfaces/ReactionList';
import { generateUniqueID } from '@src/helpers/Helpers';
import { getUnixTimestamp } from '@src/helpers/DateHelper';
import { Template } from '@src/types/templates';

export const prepareMessageList = (
	messages: Message[],
	existingMessages: ChatMessageList = {}
) => {
	const result: ChatMessageList = {};
	messages.forEach((message) => {
		// Ignore messages without timestamp
		// Ignore messages that are already loaded
		if (
			(parseIntSafely(message.waba_payload?.timestamp) ?? -1) > 0 &&
			!(message.waba_payload && message.waba_payload.id in existingMessages)
		) {
			// Consider switching to getchat id only
			const messageKey =
				message.waba_payload?.id ?? generateMessageInternalId(message.id);
			result[messageKey] = message;
		}
	});

	return result;
};

export const prepareReactions = (messages: ChatMessageList) => {
	let reactions: ReactionList = {};
	Object.values(messages)
		.filter((item) => item.waba_payload?.type === MessageType.reaction)
		.forEach((item) => {
			const message = item;
			const parentMessageId = message.waba_payload?.reaction?.message_id;
			if (parentMessageId) {
				if (!reactions[parentMessageId]) {
					reactions[parentMessageId] = [message];
				} else {
					reactions[parentMessageId].push(message);
				}
			}
		});

	return reactions;
};

export const generateEmptyMessage = () => {
	const message: Message = {
		id: '',
		customer_wa_id: '',
		from_us: true,
		received: true,
		tags: [],
		chat_tags: [],
		is_failed: false,
		waba_payload: {
			id: '',
			type: MessageType.none,
			timestamp: '-1',
		},
	};
	return message;
};

export const fromAssignmentEvent = (
	assignmentEvent: ChatAssignment
): Message => {
	const id =
		'assignmentEvent_' + assignmentEvent.timestamp + '_' + generateUniqueID();
	return {
		...generateEmptyMessage(),
		id,
		customer_wa_id: assignmentEvent.wa_id,
		assignment_event: assignmentEvent,
		waba_payload: {
			id,
			type: MessageType.none,
			timestamp: assignmentEvent.timestamp?.toString(),
		},
	};
};

export const fromTemplate = (template: Template): Message => {
	return {
		...generateEmptyMessage(),
		waba_payload: {
			id: generateUniqueID(),
			type: MessageType.interactive,
			template: template,
			timestamp: getUnixTimestamp().toString(),
		},
	};
};

export const fromInteractive = (interactive: any): Message => {
	return {
		...generateEmptyMessage(),
		waba_payload: {
			id: generateUniqueID(),
			type: MessageType.interactive,
			interactive: interactive,
			timestamp: getUnixTimestamp().toString(),
		},
	};
};

export const fromTaggingEvent = (taggingEvent: ChatTagging): Message => {
	const id =
		'taggingEvent_' + taggingEvent.timestamp + '_' + generateUniqueID();
	return {
		...generateEmptyMessage(),
		id,
		customer_wa_id: taggingEvent.chat,
		tagging_event: taggingEvent,
		waba_payload: {
			id,
			type: MessageType.none,
			timestamp: taggingEvent.timestamp?.toString(),
		},
	};
};

export const getMessageTimestamp = (message: Message | undefined) =>
	message ? parseIntSafely(message.waba_payload?.timestamp) : undefined;

export const getSenderName = (message: Message) => {
	if (message.sender) {
		const firstName = message.sender.first_name;
		const lastName = message.sender.last_name;

		if (firstName || lastName) {
			return firstName + (lastName ? ' ' + lastName : '');
		} else {
			return message.sender?.username;
		}
	}

	return !message.from_us ? message.contact?.waba_payload?.profile?.name : 'Us';
};

export const getUniqueSender = (message: Message) =>
	message.sender?.username ?? message.waba_payload?.from;

export const generateMessageInternalId = (getChatId: string) => {
	return 'getchatId_' + getChatId;
};

export const hasAnyStatus = (message: Message) => {
	return (
		(message.waba_statuses?.sent ?? 0) > 0 ||
		(message.waba_statuses?.delivered ?? 0) > 0 ||
		(message.waba_statuses?.read ?? 0) > 0
	);
};

export const getStatus = (message: Message) => {
	if (message.waba_statuses?.read) {
		return MessageStatus.read;
	}

	if (message.waba_statuses?.delivered) {
		return MessageStatus.delivered;
	}

	if (message?.waba_statuses?.sent) {
		return MessageStatus.sent;
	}

	return MessageStatus.pending;
};

export const isRead = (message: Message) =>
	getStatus(message) === MessageStatus.read;

export const isPending = (message: Message) =>
	getStatus(message) === MessageStatus.pending;

export const isJustSent = (message: Message) =>
	getStatus(message) === MessageStatus.sent;

export const isDeliveredOrRead = (message: Message) => {
	const status = getStatus(message);
	return status === MessageStatus.delivered || status === MessageStatus.read;
};

export const getMessageCaption = (message: Message | undefined) => {
	if (message) {
		const caption =
			message.waba_payload?.image?.caption ??
			message.waba_payload?.video?.caption ??
			message.waba_payload?.audio?.caption ??
			message.waba_payload?.document?.caption;
		return caption ? sanitize(caption) : undefined;
	}
};

export const getMessageMimeType = (message: Message) => {
	const payload = message.waba_payload;
	if (payload) {
		return (
			payload.image?.mime_type ??
			payload.video?.mime_type ??
			payload.audio?.mime_type ??
			payload.voice?.mime_type ??
			payload.document?.mime_type
		);
	}
};

export const hasAnyAudio = (message: Message) => {
	return (
		message.waba_payload?.voice?.id !== undefined ||
		message.waba_payload?.audio?.id !== undefined
	);
};

export const hasMediaToPreview = (message: Message) => {
	return (
		message.waba_payload?.image !== undefined ||
		message.waba_payload?.video !== undefined ||
		getHeaderFileLink(message, 'image') ||
		getHeaderFileLink(message, 'video')
	);
};

export const getHeaderFileLink = (message: Message, type: string) => {
	try {
		if (message.waba_payload?.type === MessageType.template) {
			if (message.waba_payload?.template?.components) {
				for (
					let i = 0;
					i < message.waba_payload.template.components.length;
					i++
				) {
					const component = message.waba_payload.template.components[i];

					if (
						component &&
						component.type.toLowerCase() === 'header' &&
						component.parameters?.length
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
};

export const generateReferralImageLink = (message: Message) => {
	if (message.waba_payload?.referral?.image) {
		return (
			message.waba_payload.referral.image.link ??
			generateMediaLink(message.waba_payload.referral.image.id)
		);
	} else if (message.waba_payload?.referral?.image_url) {
		return message.waba_payload?.referral.image_url;
	}
};

export const generateReferralVideoLink = (message: Message) => {
	if (message.waba_payload?.referral?.video) {
		return (
			message.waba_payload.referral.video.link ??
			generateMediaLink(message.waba_payload.referral?.video?.id)
		);
	} else if (message.waba_payload?.referral?.video_url) {
		return message.waba_payload.referral.video_url;
	}
};

const generateMediaLink = (id: string | number | undefined) => {
	return id ? `${window.config.API_BASE_URL}media/${id}` : undefined;
};

export const generateImageLink = (
	message: Message,
	includeTemplateHeader = false
) => {
	return (
		message.waba_payload?.image?.link ??
		generateMediaLink(message.waba_payload?.image?.id) ??
		(includeTemplateHeader ? getHeaderFileLink(message, 'image') : undefined)
	);
};

export const generateVideoLink = (
	message: Message,
	includeTemplateHeaderOrReferral = false
) => {
	return (
		message.waba_payload?.video?.link ??
		generateMediaLink(message.waba_payload?.video?.id) ??
		(includeTemplateHeaderOrReferral
			? getHeaderFileLink(message, 'video') ??
			  generateReferralVideoLink(message)
			: undefined)
	);
};

export const generateAudioLink = (message: Message) => {
	return (
		message.waba_payload?.audio?.link ??
		generateMediaLink(message.waba_payload?.audio?.id)
	);
};

export const generateDocumentLink = (message: Message) => {
	return (
		message.waba_payload?.document?.link ??
		generateMediaLink(message.waba_payload?.document?.id)
	);
};

export const generateVoiceLink = (message: Message) => {
	return (
		message.waba_payload?.voice?.link ??
		generateMediaLink(message.waba_payload?.voice?.id)
	);
};

export const generateStickerLink = (message: Message) => {
	return (
		message.waba_payload?.sticker?.link ??
		generateMediaLink(message.waba_payload?.sticker?.id)
	);
};

export const canRetry = (message: Message) => {
	let result = false;

	if (
		message.waba_payload?.errors &&
		Array.isArray(message.waba_payload.errors)
	) {
		for (let i = 0; i < message.waba_payload.errors.length; i++) {
			if (
				ERR_CODES_FOR_RETRY.includes(
					message.waba_payload.errors[i]?.['code'] ?? 0
				)
			) {
				result = true;
				break;
			}
		}
	}

	return result;
};

export const formatMessage = (message: string | undefined) => {
	if (!message) return;

	let formatted: string | undefined = message.replaceAll('\n', '<br/>');
	formatted = sanitize(formatted);
	formatted = replaceEmojis(formatted ?? '');

	return formatted;
};

export const generateMessagePreview = (payload: any) => {
	const messageType = payload?.type;
	if (messageType === 'text') {
		return payload?.text?.body ?? '';
	} else if (messageType === 'template') {
		return 'Template: ' + (payload?.template?.name ?? '');
	} else {
		return messageType;
	}
};

export const ERR_CODES_FOR_RETRY = [
	400, 410, 429, 430, 432, 433, 470, 471, 500, 1000, 1005, 1011, 1015, 1016,
	1018, 1023, 1024, 1026, 1031,
];
