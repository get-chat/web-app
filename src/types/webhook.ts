import { MessageWabaPayload, WebhookMessageStatus } from '@src/types/messages';
import { ContactWabaPayload } from '@src/types/contacts';

export interface WabaWebhook {
	type: string;
	waba_payload: WabaWebhookWabaPayload;
}

export interface WabaWebhookWabaPayload {
	object: string;
	entry: WabaWebhookEntry[];
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
