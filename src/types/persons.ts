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
	// POSIX timestamp (seconds) after which a non-template message is rejected
	// with HTTP 453. The effective customer care messaging window as computed by
	// the API: never null there.
	// Read it via getMessagingWindowExpiresAt() instead of assuming a duration.
	messaging_window_expires_at?: number;
	// What opened the conversation, as reported by Meta alongside the window:
	// `service`, `marketing`, `utility`, `authentication`, or
	// `referral_conversion` for a Click-to-WhatsApp (CTWA) ad. Null when unknown.
	messaging_window_origin?: string | null;
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
