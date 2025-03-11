import ChosenFileClass from '@src/ChosenFileClass';

interface PendingMessage {
	id: string;
	requestBody: any;
	successCallback?: () => void;
	errorCallback?: () => void;
	completeCallback?: () => void;
	formData: any;
	chosenFile?: ChosenFileClass | undefined;
	isFailed: boolean;
	willRetry: boolean;
}

export default PendingMessage;
