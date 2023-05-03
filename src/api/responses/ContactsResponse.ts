import ContactModel from '../models/ContactModel';

interface ResponseData {
	results: [];
	count: Number;
	next: string | null;
}

class ContactsResponse {
	public contacts: ContactModel[];
	public results;
	public count;
	public next;

	constructor(data: ResponseData) {
		this.next = data.next;
		this.count = data.count;
		this.results = data.results;

		let contacts: ContactModel[] = [];
		data.results.forEach((contact: any) => {
			const contactInstance = new ContactModel(contact);
			contacts.push(contactInstance);
		});
		this.contacts = contacts;
	}
}

export default ContactsResponse;
