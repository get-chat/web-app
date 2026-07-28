import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';

// A chat identifier (wa_id) used to always be a phone number, but it can now
// also be a Business-Scoped User ID (BSUID) for contacts who hide their phone
// number, e.g. "US.123456789012345678" or "US.ENT.123abc". A BSUID is NOT
// all-digits: it contains a dot and/or letters. These helpers therefore treat
// anything that isn't a plain phone number as an opaque identifier.

// True only for plain phone numbers: digits with an optional leading "+".
export const isPhoneNumber = (
	identifier: string | undefined | null
): boolean => {
	if (!identifier) return false;
	return /^\+?[0-9]+$/.test(identifier.trim());
};

// Normalizes a chat identifier. Phone numbers are reduced to digits only
// (so "+90 538 319 25 32" -> "905383192532"); BSUIDs are returned untouched.
export const prepareWaId = (phoneNumber: string | undefined | null) => {
	if (phoneNumber == null) return undefined;

	const trimmed = phoneNumber.trim();

	// BSUID (or any non phone-number identifier): keep it as an opaque string.
	if (/[^0-9+()\-\s]/.test(trimmed)) {
		return trimmed;
	}

	return trimmed.replace(/[^0-9]/g, '');
};

// Formats an identifier for display. Phone numbers get a leading "+";
// BSUIDs are shown as-is (never "+US.123...").
export const addPlus = (phoneNumber: string | undefined | null) => {
	if (!phoneNumber || !isPhoneNumber(phoneNumber)) return phoneNumber;
	return phoneNumber.includes('+') ? phoneNumber : `+${phoneNumber}`;
};

// India's country calling code. E.164 country codes are prefix-free, so a
// startsWith check on a normalized number is unambiguous.
const INDIA_CALLING_CODE = '91';

// True when the identifier is a phone number from India (+91).
// BSUIDs and other non phone-number identifiers return false.
export const isIndianPhoneNumber = (
	identifier: string | undefined | null
): boolean => {
	if (!isPhoneNumber(identifier)) return false;
	const digits = prepareWaId(identifier);
	return typeof digits === 'string' && digits.startsWith(INDIA_CALLING_CODE);
};

// Detects the ISO country of a wa_id / phone number (e.g. "905383192532" -> "TR").
// wa_ids are stored digits-only without a leading "+", so we add it before
// parsing. BSUIDs and unparseable numbers return undefined.
export const getCountryFromWaId = (
	waId: string | undefined | null
): CountryCode | undefined => {
	if (!isPhoneNumber(waId)) return undefined;
	const digits = prepareWaId(waId);
	if (!digits) return undefined;
	return parsePhoneNumberFromString(`+${digits}`)?.country;
};

// Returns the flag emoji for an ISO 3166-1 alpha-2 country code by mapping each
// letter to its regional indicator symbol. Platforms without flag-emoji support
// (e.g. Windows) render the two letters instead, which is an acceptable fallback.
export const getFlagEmoji = (country: CountryCode): string => {
	return country
		.toUpperCase()
		.replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
};
