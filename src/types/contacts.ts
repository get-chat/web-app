import { Profile } from '@src/types/messages';

export interface Contact {
	wa_id: string;
	waba_payload: ContactWabaPayload;
	initials: string;
	last_message_timestamp: number;
	phone_numbers?: PhoneNumberDescribed[];
	email_addresses?: string[];
	urls?: string[];
	contact_provider?: {
		type: string;
	};
}

export interface PhoneNumberDescribed {
	phone_number: string;
	description?: string;
}

export interface ContactWabaPayload {
	profile: Profile;
	wa_id: string;
}

export interface ResolveContactResponse {
	person?: Contact;
	contact_provider_results: [];
}

export interface FetchContactsRequest {
	search?: string;
	limit?: number;
	pages?: string | number | null;
}
