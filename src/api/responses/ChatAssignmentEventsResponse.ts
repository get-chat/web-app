import ChatMessageModel from '../models/ChatMessageModel';
import ChatMessageList from '@src/interfaces/ChatMessageList';

class ChatAssignmentEventsResponse {
	public messages: ChatMessageList;

	constructor(data: any, reverse: boolean) {
		if (reverse) {
			data.results.reverse();
		}

		const messages: ChatMessageList = {};
		data.results.forEach((assignmentEvent: any) => {
			const prepared = ChatMessageModel.fromAssignmentEvent(assignmentEvent);
			messages[prepared.id] = prepared;
		});
		this.messages = messages;
	}
}

export default ChatAssignmentEventsResponse;
