import ChatMessageList from '@src/interfaces/ChatMessageList';
import {
	Message,
	MessageEchoOrigin,
	MessageWabaPayload,
	WebhookMessageStatus,
} from '@src/types/messages';
import { WabaWebhookWabaPayload } from '@src/types/webhook';
import { ContactWabaPayload } from '@src/types/contacts';
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

/**
 * A WhatsApp group message belongs to the group's chat (wa_id = group_id),
 * not to the participant who sent it (`from`, contacts[]), who becomes its
 * group_participant instead.
 */
const fromIncomingGroupMessage = (
	message: Message,
	wabaPayload: MessageWabaPayload,
	contacts: ContactWabaPayload[] | undefined
): Message => {
	const contact =
		contacts?.find(
			(item) =>
				(wabaPayload.from && item.wa_id === wabaPayload.from) ||
				(wabaPayload.from_user_id && item.user_id === wabaPayload.from_user_id)
		) ?? (contacts?.length === 1 ? contacts[0] : undefined);

	return {
		...message,
		customer_wa_id: wabaPayload.group_id ?? message.customer_wa_id,
		group_participant: message.group_participant ?? {
			wa_id: wabaPayload.from,
			user_id: wabaPayload.from_user_id,
			name: contact?.profile?.name,
		},
	};
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
					const message = fromIncomingMessageWabaPayload(msg);
					messages[msg.id] = msg.group_id
						? fromIncomingGroupMessage(message, msg, change.value.contacts)
						: message;
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
			const groupId = message.waba_payload?.group_id;
			messages[messageKey] = groupId
				? {
						...message,
						customer_wa_id: groupId,
						// The envelope's version knows the sender's profile name
						group_participant:
							message.group_participant ??
							messages[messageKey]?.group_participant,
				  }
				: message;
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
