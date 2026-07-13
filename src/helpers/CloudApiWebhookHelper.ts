import ChatMessageList from '@src/interfaces/ChatMessageList';
import { MessageEchoOrigin, WebhookMessageStatus } from '@src/types/messages';
import { WabaWebhookWabaPayload } from '@src/types/webhook';
import {
	fromIncomingMessageWabaPayload,
	generateMessageInternalId,
} from '@src/helpers/MessageHelper';
import { WEBHOOK_FIELD_SMB_MESSAGE_ECHOES } from '@src/Constants';

interface WebhookResult {
	messages: ChatMessageList;
	statuses: { [key: string]: WebhookMessageStatus };
}

const findEchoOrigin = (payload: WabaWebhookWabaPayload): MessageEchoOrigin => {
	let origin = MessageEchoOrigin.api;

	payload?.entry?.forEach((entry) => {
		entry?.changes?.forEach((change) => {
			if (change?.field === WEBHOOK_FIELD_SMB_MESSAGE_ECHOES) {
				origin = MessageEchoOrigin.smb;
			}
		});
	});

	return origin;
};

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

	// Incoming messages are also delivered as getchat-serialized messages
	// next to the Cloud API envelope. They carry the fields the envelope
	// lacks (most notably the resolved reply context), so they replace the
	// envelope-derived versions built above.
	const incomingMessages = payload?.incoming_messages;
	if (incomingMessages) {
		incomingMessages.forEach((message) => {
			const messageKey =
				message.waba_payload?.id ?? generateMessageInternalId(message.id);
			messages[messageKey] = message;
		});
	}

	// Message echoes: outgoing messages sent outside get.chat, delivered as
	// getchat-serialized messages next to the Cloud API envelope
	const echoMessages = payload?.echo_messages;
	if (echoMessages) {
		const echoOrigin = findEchoOrigin(payload);
		echoMessages.forEach((message) => {
			// Same keying as prepareMessageList, so a later REST fetch of the
			// same message dedupes instead of rendering it twice
			const messageKey =
				message.waba_payload?.id ?? generateMessageInternalId(message.id);
			messages[messageKey] = {
				...message,
				echo_origin: echoOrigin,
			};
		});
	}

	return { messages, statuses };
};
