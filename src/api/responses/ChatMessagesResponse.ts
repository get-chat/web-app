import ChatMessageModel from '../models/ChatMessageModel';
import ChatMessageList from '@src/interfaces/ChatMessageList';

interface ResponseData {
	results: [];
	count: Number;
	next: string | null;
}

class ChatMessagesResponse {
	public messages;
	public count;
	public next;

	constructor(
		data: ResponseData,
		existingMessages: ChatMessageList = {},
		reverse: boolean = false
	) {
		if (reverse) {
			data.results.reverse();
		}

		const messages: ChatMessageList = {};
		data.results.forEach((message) => {
			const prepared = new ChatMessageModel(message);

			// Ignore messages without timestamp
			// Ignore messages that are already loaded
			if (prepared.timestamp > 0 && !(prepared.id in existingMessages)) {
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
