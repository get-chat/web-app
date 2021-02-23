import {getAttachmentTypeByMimeType} from "./Helpers";

class ChosenFileClass {
    constructor(key, data) {
        this.key = key;
        this.fileURL = URL.createObjectURL(data);
        this.file = data;
        this.attachmentType = getAttachmentTypeByMimeType(data.type);
        this.type = data.type;
        this.caption = '';
        this.isPDF = this.type.includes('application/pdf')
    }
}

export default ChosenFileClass;