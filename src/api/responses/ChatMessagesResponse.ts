// @ts-nocheck
import ChatMessageModel from '../models/ChatMessageModel';

class ChatMessagesResponse {
	constructor(data, reverse) {
		if (reverse) {
			data.results.reverse();
		}

		const messages = {};
		data.results.forEach((message) => {
			const prepared = new ChatMessageModel(message);

			// Ignore messages without timestamp
			if (prepared.timestamp > 0) {
				// Consider switching to getchat id only
				const messageKey = prepared.id ?? prepared.generateInternalIdString();
				messages[messageKey] = prepared;
			}
		});
		this.messages = messages;

		this.count = data.count;
		this.next = data.next;
	}
}

export default ChatMessagesResponse;
