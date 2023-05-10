import NewMessagesList from '@src/interfaces/NewMessagesList';

class NewMessageModel {
	public waId: string;
	public newMessages: NewMessagesList;

	constructor(waId: string, newMessages: NewMessagesList) {
		this.waId = waId;
		this.newMessages = newMessages;
	}
}

export default NewMessageModel;
