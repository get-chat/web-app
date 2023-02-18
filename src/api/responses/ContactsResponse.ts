// @ts-nocheck
import ContactModel from '../models/ContactModel';

class ContactsResponse {
	constructor(data) {
		this.next = data.next;
		this.count = data.count;
		this.results = data.results;

		let contacts = [];
		data.results.forEach((contact) => {
			const contactInstance = new ContactModel(contact);
			contacts.push(contactInstance);
		});
		this.contacts = contacts;
	}
}

export default ContactsResponse;
