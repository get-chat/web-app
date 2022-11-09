import ChatMessageModel from '../models/ChatMessageModel';

class ChatTaggingEventsResponse {
	constructor(data, reverse) {
		if (reverse) {
			data.results.reverse();
		}

		const messages = {};
		data.results.forEach((taggingEvent) => {
			const prepared = ChatMessageModel.fromTaggingEvent(taggingEvent);
			messages[prepared.id] = prepared;
		});
		this.messages = messages;
	}
}

export default ChatTaggingEventsResponse;
