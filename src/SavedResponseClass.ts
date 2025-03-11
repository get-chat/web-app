import { sanitize } from './helpers/Helpers';

class SavedResponseClass {
	public id: string;
	public text: string | undefined | null;
	public timestamp: number;

	constructor(data: any) {
		this.id = data.id;
		this.text = data.text;
		this.timestamp = data.timestamp;
	}

	purify() {
		this.text = sanitize(this.text);
	}
}

export default SavedResponseClass;
