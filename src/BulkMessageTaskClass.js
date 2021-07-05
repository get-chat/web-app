class BulkMessageTaskClass {

    constructor(data) {
        this.id = data.id;
        this.sender = data.sender;
        this.total = data.total;
        this.done = data.done;
    }
}

export default BulkMessageTaskClass;