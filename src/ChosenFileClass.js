import {getAttachmentTypeByFile} from "./helpers/FileHelper";
import {EVENT_TOPIC_RELOAD_PREVIEW} from "./Constants";
import PubSub from "pubsub-js";

class ChosenFileClass {
    constructor(key, data, checkAudioCodec) {
        const thisObject = this;

        this.key = key;
        this.fileURL = URL.createObjectURL(data);
        this.file = data;

        let callback;

        if (checkAudioCodec === true) {
            callback = function (type) {
                thisObject.attachmentType = type;

                // An event is published to force preview to render again
                PubSub.publishSync(EVENT_TOPIC_RELOAD_PREVIEW, type);
            }
        }

        this.attachmentType = getAttachmentTypeByFile(data, callback);
        this.type = data.type;
        this.caption = '';
        this.isPDF = this.type.includes('application/pdf');
    }
}

export default ChosenFileClass;