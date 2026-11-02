import { prepareWaId } from '@src/helpers/PhoneNumberHelper';
import { ContactSavedName } from '@src/types/persons';

// `contact_provider.id` of the inbox's own contacts in `/contacts/`, as opposed
// to an external contact provider's
export const INBOX_CONTACT_PROVIDER_ID = '00000000-0000-0000-0000-000000000000';

export const prepareContactProvidersData = (rawData: any[]) => {
	let contactProvidersData: { [key: string]: any } = {};
	rawData.forEach((contact) => {
		const contactPhoneNumbers: any[] = contact.phone_numbers;

		const processedPhoneNumbers: any[] = [];
		contactPhoneNumbers.forEach((contactPhoneNumber) => {
			const waId = prepareWaId(contactPhoneNumber.phone_number);

			// Prevent duplicates from same provider with same phone numbers formatted differently
			if (processedPhoneNumbers.includes(waId)) {
				return;
			}

			if (waId) {
				if (!(waId in contactProvidersData)) {
					contactProvidersData[waId] = [];
				}

				contactProvidersData[waId].push(contact);
				processedPhoneNumbers.push(waId);
			}
		});
	});

	return contactProvidersData;
};

/**
 * Applies a `contact_saved_name` WebSocket event to contact providers data. The
 * inbox's own contacts are in it too, under the name the API showed when it was
 * loaded, and that name outranks the chat's: without this a renamed chat keeps
 * its old name until the cache expires. External providers' contacts are left
 * alone. Returns the data itself when nothing in it changed.
 */
export const applyContactSavedNamesToProviders = (
	contactProvidersData: { [key: string]: any },
	updates: ContactSavedName[]
) => {
	let isChanged = false;
	const nextData = { ...contactProvidersData };
	updates.forEach((update) => {
		const contacts = nextData[update.wa_id];
		if (!Array.isArray(contacts)) return;

		nextData[update.wa_id] = contacts.map((contact) => {
			if (contact?.contact_provider?.id !== INBOX_CONTACT_PROVIDER_ID) {
				return contact;
			}
			isChanged = true;
			return { ...contact, name: update.name, initials: update.initials };
		});
	});
	return isChanged ? nextData : contactProvidersData;
};
