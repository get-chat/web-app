import ChatMessageList from '@src/interfaces/ChatMessageList';
import { WebhookMessageStatus } from '@src/types/messages';
import { WabaWebhookWabaPayload } from '@src/types/webhook';
import { fromIncomingMessageWabaPayload } from '@src/helpers/MessageHelper';

interface WebhookResult {
	messages: ChatMessageList;
	statuses: { [key: string]: WebhookMessageStatus };
}

export const processCloudApiWebhookPayload = (
	payload: WabaWebhookWabaPayload
): WebhookResult => {
	const messages: ChatMessageList = {};
	const statuses: { [key: string]: WebhookMessageStatus } = {};

	payload?.entry?.forEach((entry) => {
		entry?.changes?.forEach((change) => {
			// Incoming messages
			const incomingMessages = change?.value?.messages;
			if (incomingMessages) {
				incomingMessages.forEach((msg) => {
					messages[msg.id] = fromIncomingMessageWabaPayload(msg);
				});
			}

			// Statuses
			const statusList = change?.value?.statuses;
			if (statusList) {
				statusList.forEach((statusObj) => {
					statuses[statusObj.id] = statusObj;
				});
			}
		});
	});

	return { messages, statuses };
};
