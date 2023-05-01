class ContactModel {
	public name?: string;
	public initials?: string;
	public avatar?: string;
	public largeAvatar?: string;
	public phoneNumbers = [];
	public contactProvider: string;

	constructor(data: any) {
		this.name = data.name;
		this.initials = data.initials;
		this.avatar = data.avatar;
		this.largeAvatar = data.largeAvatar;
		this.phoneNumbers = data.phone_numbers;
		this.contactProvider = data.contact_provider?.type;
	}
}

export default ContactModel;
