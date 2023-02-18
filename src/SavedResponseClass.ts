import { sanitize } from './helpers/Helpers';

class SavedResponseClass {
	constructor(data) {
		this.id = data.id;
		this.text = data.text;
		this.timestamp = data.timestamp;
	}

	purify() {
		this.text = sanitize(this.text);
	}
}

export default SavedResponseClass;
