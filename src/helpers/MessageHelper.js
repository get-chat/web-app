import { replaceEmojis } from './EmojiHelper';
import { getLastObject } from './ObjectHelper';

import { sanitize } from 'dompurify';

export const formatMessage = (message) => {
	if (!message) return;

	let formatted = message.replaceAll('\n', '<br/>');
	formatted = sanitize(formatted);
	formatted = replaceEmojis(formatted);

	return formatted;
};
export const messageHelper = (messagesObject) => {
	const last = getLastObject(messagesObject);
	return extractTimestampFromMessage(last);
};
export const extractTimestampFromMessage = (message) => {
	return message ? parseInt(message.timestamp) : -1;
};
export const generateMessagePreview = (payload) => {
	const messageType = payload?.type;
	if (messageType === 'text') {
		return payload?.text?.body ?? '';
	} else if (messageType === 'template') {
		return 'Template: ' + (payload?.template?.name ?? '');
	} else {
		return messageType;
	}
};
