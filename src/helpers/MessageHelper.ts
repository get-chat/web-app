import { replaceEmojis } from './EmojiHelper';
import { getLastObject } from './ObjectHelper';
// @ts-ignore
import { sanitize } from 'dompurify';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { Message } from '@src/types/messages';
import { parseIntSafely } from '@src/helpers/IntegerHelper';
import ReactionList from '@src/interfaces/ReactionList';

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
		.filter(
			(item) => item.waba_payload?.type === ChatMessageModel.TYPE_REACTION
		)
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

export const getMessageTimestamp = (message: Message) =>
	parseIntSafely(message.waba_payload?.timestamp) ?? -1;

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
	return +'getchatId_' + getChatId;
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

export const hasMediaToPreview = (message: Message) => {
	return (
		message.waba_payload?.image !== undefined ||
		message.waba_payload?.video !== undefined ||
		getHeaderFileLink(message, 'image') ||
		getHeaderFileLink(message, 'video')
	);
};

const getHeaderFileLink = (message: Message, type: string) => {
	try {
		if (message.waba_payload?.type === ChatMessageModel.TYPE_TEMPLATE) {
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
};

const generateReferralVideoLink = (message: Message) => {
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

export const formatMessage = (message: string | undefined) => {
	if (!message) return;

	let formatted: string | undefined = message.replaceAll('\n', '<br/>');
	formatted = sanitize(formatted);
	formatted = replaceEmojis(formatted ?? '');

	return formatted;
};

export const messageHelper = (messagesObject: ChatMessageList) => {
	const last = getLastObject(messagesObject);
	return extractTimestampFromMessage(last);
};

export const extractTimestampFromMessage = (message: ChatMessageModel) => {
	return message?.timestamp ?? -1;
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
