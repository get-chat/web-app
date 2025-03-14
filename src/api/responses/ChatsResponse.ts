import ChatModel from '../models/ChatModel';
import { CHAT_KEY_PREFIX } from '@src/Constants';
import NewMessageModel from '../models/NewMessageModel';
import ChatList from '@src/interfaces/ChatList';
import NewMessageList from '@src/interfaces/NewMessageList';

class ChatsResponse {
	public count: number;
	public chats: ChatList;
	public newMessages: NewMessageList;

	constructor(data: any) {
		let chats: ChatList = {};
		let newMessages: NewMessageList = {};
		data.results.forEach((chatData: any) => {
			// Chat
			const chat = new ChatModel(chatData);
			chats[CHAT_KEY_PREFIX + chat.waId] = chat;

			// New messages
			const newWaId = chatData.contact.waba_payload.wa_id;
			const newAmount = chatData.new_messages;
			const prepared = new NewMessageModel(newWaId, newAmount);
			newMessages[prepared.waId] = prepared;
		});
		this.count = data.count;
		this.chats = chats;
		this.newMessages = newMessages;
	}
}

export default ChatsResponse;
