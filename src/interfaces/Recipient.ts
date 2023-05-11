import PhoneNumberWithDescription from '@src/interfaces/PhoneNumberWithDescription';

interface Recipient {
	name?: string;
	initials?: string;
	avatar?: string;
	phoneNumbers: PhoneNumberWithDescription[];
	provider?: string;
}

export default Recipient;
