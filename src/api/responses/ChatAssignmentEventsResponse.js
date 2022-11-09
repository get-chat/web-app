import ChatMessageModel from '../models/ChatMessageModel';

class ChatAssignmentEventsResponse {
	constructor(data) {
		const messages = {};
		data.results.forEach((assignmentEvent) => {
			const prepared = ChatMessageModel.fromAssignmentEvent(assignmentEvent);
			messages[prepared.id] = prepared;
		});
		this.messages = messages;
	}
}

export default ChatAssignmentEventsResponse;
