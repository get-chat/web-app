import { sanitize } from '@src/helpers/Helpers';

class SavedResponseModel {
	public id: Number;
	public text: string;
	public timestamp = -1;

	constructor(data: any) {
		this.id = data.id;
		this.text = data.text;
		this.timestamp = data.timestamp;

		this.purify();
	}

	purify() {
		this.text = sanitize(this.text);
	}
}

export default SavedResponseModel;
