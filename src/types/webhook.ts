import { MessageWabaPayload, WebhookMessageStatus } from '@src/types/messages';

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
	contacts?: WabaWebhookContact[];
	messages?: MessageWabaPayload[];
	statuses?: WebhookMessageStatus[];
}

export interface WabaWebhookMetadata {
	display_phone_number: string;
	phone_number_id: string;
}

// --- Message Related Interfaces ---

export interface WabaWebhookContact {
	profile: {
		name: string;
	};
	wa_id: string;
}
