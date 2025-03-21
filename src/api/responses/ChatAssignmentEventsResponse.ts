import ChatMessageList from '@src/interfaces/ChatMessageList';
import { fromAssignmentEvent } from '@src/helpers/MessageHelper';

class ChatAssignmentEventsResponse {
	public messages: ChatMessageList;

	constructor(data: any, reverse: boolean) {
		if (reverse) {
			data.results.reverse();
		}

		const messages: ChatMessageList = {};
		data.results.forEach((assignmentEvent: any) => {
			const prepared = fromAssignmentEvent(assignmentEvent);
			messages[prepared.id] = prepared;
		});
		this.messages = messages;
	}
}

export default ChatAssignmentEventsResponse;
