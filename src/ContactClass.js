class ContactClass {
	constructor(data) {
		this.name = data.name;
		this.initials = data.initials;
		this.avatar = data.avatar;
		this.largeAvatar = data.largeAvatar;
		this.phoneNumbers = data.phone_numbers;
		this.contactProvider = data.contact_provider?.type;
	}
}

export default ContactClass;
