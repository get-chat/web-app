import PhoneNumberWithDescription from '@src/api/models/interfaces/PhoneNumberWithDescription';

interface Recipient {
	name?: string;
	initials?: string;
	avatar?: string;
	phoneNumbers: PhoneNumberWithDescription[];
}

export default Recipient;
