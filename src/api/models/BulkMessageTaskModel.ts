import { Template } from '@src/types/templates';

class BulkMessageTaskModel {
	public id: string;
	public recipients: string[];
	public tags: string[];
	public type: string;
	public template?: Template;
	public payload: any;
	public sender: any;
	public total: number;
	public done: boolean;
	public timestamp: number;

	constructor(data: any) {
		this.id = data.id;
		this.recipients = data.recipients;
		this.tags = data.tags;
		this.type = data.type;
		this.template = data.template;
		this.payload = data.payload;
		this.sender = data.sender;
		this.total = data.total;
		this.done = data.done;
		this.timestamp = data.timestamp;
	}
}

export default BulkMessageTaskModel;
