import NewMessagesList from '@src/api/models/interfaces/NewMessagesList';

class NewMessageModel {
	public waId: string;
	public newMessages: NewMessagesList;

	constructor(waId: string, newMessages: NewMessagesList) {
		this.waId = waId;
		this.newMessages = newMessages;
	}
}

export default NewMessageModel;
