import { ContactWabaPayload, PhoneNumberDescribed } from '@src/types/contacts';

export interface Person {
	wa_id: string;
	// Business-Scoped User ID, set when the contact hides their phone number.
	bsuid?: string | null;
	// Null for username-only (BSUID) contacts.
	phone_number?: string | null;
	waba_payload: ContactWabaPayload;
	initials: string;
	last_message_timestamp: number;
	resolved: boolean;
}

export interface FetchPersonsRequest {
	limit?: number;
	offset?: number;
	search?: string;
}

export interface Recipient {
	name?: string;
	initials?: string;
	avatar?: string;
	phone_numbers: PhoneNumberDescribed[];
	provider?: string;
}

export type PersonList = {
	[key: string]: Person;
};
