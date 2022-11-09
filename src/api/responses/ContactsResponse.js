import ContactModel from '../models/ContactModel';
import PhoneNumberHelper from '../../helpers/PhoneNumberHelper';

class ContactsResponse {
	constructor(data) {
		let contacts = [];
		data.results.forEach((contact) => {
			const contactInstance = new ContactModel(contact);
			contacts.push(contactInstance);
		});
		this.contacts = contacts;

		let contactProvidersData = {};
		data.results.forEach((contact) => {
			const contactPhoneNumbers = contact.phone_numbers;

			const processedPhoneNumbers = [];
			contactPhoneNumbers.forEach((contactPhoneNumber) => {
				const curPhoneNumber = PhoneNumberHelper.preparePhoneNumber(
					contactPhoneNumber.phone_number
				);

				// Prevent duplicates from same provider with same phone numbers formatted differently
				if (processedPhoneNumbers.includes(curPhoneNumber)) {
					return;
				}

				if (!(curPhoneNumber in contactProvidersData)) {
					contactProvidersData[curPhoneNumber] = [];
				}

				contactProvidersData[curPhoneNumber].push(contact);

				processedPhoneNumbers.push(curPhoneNumber);
			});
		});

		this.contactProvidersData = contactProvidersData;
	}
}

export default ContactsResponse;
