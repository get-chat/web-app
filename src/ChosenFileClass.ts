import { getAttachmentTypeByFile } from './helpers/FileHelper';
import { EVENT_TOPIC_RELOAD_PREVIEW } from './Constants';
import PubSub from 'pubsub-js';

class ChosenFileClass {
	public key: string;
	public fileURL: string;
	public file: any;
	public attachmentType: string;
	public type: string;
	public caption: string;
	public isPDF: boolean;

	constructor(key: string, data: File, checkAudioCodec?: boolean) {
		const thisObject = this;

		this.key = key;
		this.fileURL = URL.createObjectURL(data);
		this.file = data;

		let callback;

		if (checkAudioCodec) {
			callback = function (type: string) {
				thisObject.attachmentType = type;

				// An event is published to force preview to render again
				PubSub.publishSync(EVENT_TOPIC_RELOAD_PREVIEW, type);
			};
		}

		this.attachmentType = getAttachmentTypeByFile(data, callback);
		this.type = data.type;
		this.caption = '';
		this.isPDF = this.type.includes('application/pdf');
	}
}

export default ChosenFileClass;
