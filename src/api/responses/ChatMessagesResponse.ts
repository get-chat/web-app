import ChatMessageModel from '../models/ChatMessageModel';
import ChatMessageList from '@src/interfaces/ChatMessageList';
import ReactionList from '@src/interfaces/ReactionList';

interface ResponseData {
	results: [];
	count: number;
	next: string | null;
}

class ChatMessagesResponse {
	public messages;
	public reactions;
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

		// Messages
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

		// Reactions
		this.reactions = ChatMessagesResponse.prepareReactions(messages);

		this.count = data.count;
		this.next = data.next;
	}

	static prepareReactions(messages: ChatMessageList) {
		let reactions: ReactionList = {};
		Object.entries(messages)
			.filter((item) => item[1].type === ChatMessageModel.TYPE_REACTION)
			.forEach((item) => {
				const message = item[1];
				const parentMessageId = message.reaction?.message_id;
				if (parentMessageId) {
					if (!reactions[parentMessageId]) {
						reactions[parentMessageId] = [message];
					} else {
						reactions[parentMessageId].push(message);
					}
				}
			});

		return reactions;
	}
}

export default ChatMessagesResponse;
