import { ContactWabaPayload, PhoneNumberDescribed } from '@src/types/contacts';

export interface Person {
	wa_id: string;
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
