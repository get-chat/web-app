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
			(parseIntSafely(message.waba_payload.timestamp) ?? -1) > 0 &&
			!(message.waba_payload.id in existingMessages)
		) {
			// Consider switching to getchat id only
			const messageKey =
				message.waba_payload.id ?? generateMessageInternalId(message.id);
			result[messageKey] = message;
		}
	});

	return result;
};

export const prepareReactions = (messages: ChatMessageList) => {
	let reactions: ReactionList = {};
	Object.values(messages)
		.filter((item) => item.waba_payload.type === ChatMessageModel.TYPE_REACTION)
		.forEach((item) => {
			const message = item;
			const parentMessageId = message.waba_payload.reaction?.message_id;
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

export const generateMessageInternalId = (getChatId: string) => {
	return +'getchatId_' + getChatId;
};

export const getMessageCaption = (message: Message | undefined) => {
	if (message) {
		const caption =
			message.waba_payload.image?.caption ??
			message.waba_payload.video?.caption ??
			message.waba_payload.audio?.caption ??
			message.waba_payload.document?.caption;
		return caption ? sanitize(caption) : undefined;
	}
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
