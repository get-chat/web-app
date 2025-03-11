import { prepareWaId } from '@src/helpers/PhoneNumberHelper';

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
