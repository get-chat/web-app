import { prepareWaId } from '@src/helpers/PhoneNumberHelper';

export const prepareContactProvidersData = (rawData) => {
	let contactProvidersData = {};
	rawData.forEach((contact) => {
		const contactPhoneNumbers = contact.phone_numbers;

		const processedPhoneNumbers = [];
		contactPhoneNumbers.forEach((contactPhoneNumber) => {
			const waId = prepareWaId(contactPhoneNumber.phone_number);

			// Prevent duplicates from same provider with same phone numbers formatted differently
			if (processedPhoneNumbers.includes(waId)) {
				return;
			}

			if (!(waId in contactProvidersData)) {
				contactProvidersData[waId] = [];
			}

			contactProvidersData[waId].push(contact);

			processedPhoneNumbers.push(waId);
		});
	});

	return contactProvidersData;
};
