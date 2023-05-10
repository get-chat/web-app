import Recipient from '@src/interfaces/Recipient';
import PhoneNumberWithDescription from '@src/interfaces/PhoneNumberWithDescription';

class ContactModel implements Recipient {
	public name?: string;
	public initials?: string;
	public avatar?: string;
	public largeAvatar?: string;
	public phoneNumbers: PhoneNumberWithDescription[] = [];
	public contactProvider: string;
	public provider?: string;

	constructor(data: any) {
		this.name = data.name;
		this.initials = data.initials;
		this.avatar = data.avatar;
		this.largeAvatar = data.largeAvatar;
		this.phoneNumbers = data.phone_numbers?.map((item: any) => ({
			phoneNumber: item.phone_number,
			description: item.description,
		}));
		this.provider = data.contact_provider?.type;
		this.contactProvider = data.contact_provider?.type;
	}
}

export default ContactModel;
