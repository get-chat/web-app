// @ts-nocheck
import BulkMessageTaskModel from './BulkMessageTaskModel';

class BulkMessageTaskElementModel {
	constructor(data) {
		this.id = data.id;
		this.task = new BulkMessageTaskModel(data.task);
		this.waId = data.wa_id;
		this.response = data.response;
		this.statusCode = data.status_code;
		this.timestamp = data.timestamp;
	}
}

export default BulkMessageTaskElementModel;
