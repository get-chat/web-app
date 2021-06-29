import BulkMessageTaskClass from "./BulkMessageTaskClass";

class BulkMessageTaskElementClass {

    constructor(data) {
        this.id = data.id;
        this.task = new BulkMessageTaskClass(data.task);
        this.timestamp = data.timestamp;
    }
}

export default BulkMessageTaskElementClass;