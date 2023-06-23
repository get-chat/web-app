import NewMessagesList from '@src/interfaces/NewMessagesList';

class NewMessageModel {
	public waId: string;
	public newMessages: number;

	constructor(waId: string, newMessages: number) {
		this.waId = waId;
		this.newMessages = newMessages;
	}
}

export default NewMessageModel;
