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
