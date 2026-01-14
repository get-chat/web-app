export interface Contact {
	name: string;
	initials: string;
	phone_numbers?: PhoneNumberDescribed[];
	email_addresses?: string[];
	urls?: string[];
	avatar?: string;
	large_avatar?: string;
	contact_provider?: {
		type: string;
		name?: string;
		id?: string;
	};
}

export interface PhoneNumberDescribed {
	phone_number: string;
	description?: string;
}

export interface ContactWabaPayload {
	profile: {
		name: string;
	};
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
