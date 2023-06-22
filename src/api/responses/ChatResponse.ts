import ChatModel from '@src/api/models/ChatModel';

class ChatResponse {
	public chat: ChatModel;

	constructor(data: any) {
		this.chat = new ChatModel(data);
	}
}

export default ChatResponse;
