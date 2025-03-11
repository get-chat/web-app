import BulkMessageTaskModel from './BulkMessageTaskModel';

class BulkMessageTaskElementModel {
	public id: string;
	public statusCode?: number;
	public task?: BulkMessageTaskModel;
	public waId: string;
	public response: any;
	public timestamp: number;

	constructor(data: any) {
		this.id = data.id;
		this.task = new BulkMessageTaskModel(data.task);
		this.waId = data.wa_id;
		this.response = data.response;
		this.statusCode = data.status_code;
		this.timestamp = data.timestamp;
	}
}

export default BulkMessageTaskElementModel;
