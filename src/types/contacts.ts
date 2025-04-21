import { Profile } from '@src/types/messages';

export interface Contact {
	wa_id: string;
	waba_payload: ContactWabaPayload;
	initials: string;
	last_message_timestamp: number;
}

export interface ContactWabaPayload {
	profile: Profile;
	wa_id: string;
}

export interface ResolveContactResponse {
	person?: Contact;
	contact_provider_results: [];
}
