import {
	Message,
	MessageWabaPayload,
	WebhookMessageStatus,
} from '@src/types/messages';
import { ContactWabaPayload } from '@src/types/contacts';

export interface WabaWebhook {
	type: string;
	waba_payload: WabaWebhookWabaPayload;
}

export interface WabaWebhookWabaPayload {
	object: string;
	entry: WabaWebhookEntry[];
	// Message echo events (field: message_echoes | smb_message_echoes) carry
	// the getchat-serialized messages next to the Cloud API envelope
	echo_messages?: Message[];
}

export interface WabaWebhookEntry {
	id: string;
	changes: WabaWebhookChange[];
}

export interface WabaWebhookChange {
	value: WabaWebhookValue;
	field: string;
}

export interface WabaWebhookValue {
	messaging_product: string;
	metadata: WabaWebhookMetadata;
	contacts?: ContactWabaPayload[];
	messages?: MessageWabaPayload[];
	statuses?: WebhookMessageStatus[];
}

export interface WabaWebhookMetadata {
	display_phone_number: string;
	phone_number_id: string;
}
