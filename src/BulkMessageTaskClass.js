class BulkMessageTaskClass {
	constructor(data) {
		this.id = data.id;
		this.recipients = data.recipients;
		this.tags = data.tags;
		this.payload = data.payload;
		this.sender = data.sender;
		this.total = data.total;
		this.done = data.done;
		this.timestamp = data.timestamp;
	}
}

export default BulkMessageTaskClass;
