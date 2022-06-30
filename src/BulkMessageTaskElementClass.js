import BulkMessageTaskClass from './BulkMessageTaskClass';

class BulkMessageTaskElementClass {
	constructor(data) {
		this.id = data.id;
		this.task = new BulkMessageTaskClass(data.task);
		this.waId = data.wa_id;
		this.response = data.response;
		this.statusCode = data.status_code;
		this.timestamp = data.timestamp;
	}
}

export default BulkMessageTaskElementClass;
