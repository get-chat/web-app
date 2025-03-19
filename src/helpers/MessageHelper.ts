import { replaceEmojis } from './EmojiHelper';
import { getLastObject } from './ObjectHelper';
// @ts-ignore
import { sanitize } from 'dompurify';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { Message } from '@src/types/messages';

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
