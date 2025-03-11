import ChatMessageModel from '../models/ChatMessageModel';
import ChatMessageList from '@src/interfaces/ChatMessageList';

class ChatTaggingEventsResponse {
	public messages: ChatMessageList;

	constructor(data: any, reverse: boolean) {
		if (reverse) {
			data.results.reverse();
		}

		const messages: ChatMessageList = {};
		data.results.forEach((taggingEvent: any) => {
			const prepared = ChatMessageModel.fromTaggingEvent(taggingEvent);
			messages[prepared.id] = prepared;
		});
		this.messages = messages;
	}
}

export default ChatTaggingEventsResponse;
