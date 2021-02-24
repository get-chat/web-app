import {getAttachmentTypeByFile} from "./FileHelpers";
import {EVENT_TOPIC_RELOAD_PREVIEW} from "./Constants";
import PubSub from "pubsub-js";

class ChosenFileClass {
    constructor(key, data) {
        const thisObject = this;

        this.key = key;
        this.fileURL = URL.createObjectURL(data);
        this.file = data;
        this.attachmentType = getAttachmentTypeByFile(data, function (type) {
            thisObject.attachmentType = type;

            // An event is published to force preview to render again
            PubSub.publishSync(EVENT_TOPIC_RELOAD_PREVIEW, type);
        });
        this.type = data.type;
        this.caption = '';
        this.isPDF = this.type.includes('application/pdf')
    }
}

export default ChosenFileClass;