import { ContactWabaPayload } from '@src/types/contacts';

export interface Person {
	wa_id: string;
	waba_payload: ContactWabaPayload;
	initials: string;
	last_message_timestamp: number;
}

export type PersonList = {
	[key: string]: Person;
};
