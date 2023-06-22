import { getPastHoursByTimestamp } from '@src/helpers/DateHelper';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { parseIntSafely } from '@src/helpers/IntegerHelper';
import Recipient from '@src/interfaces/Recipient';
import PhoneNumberWithDescription from '@src/interfaces/PhoneNumberWithDescription';

class PersonModel implements Recipient {
	public waId?: string;
	public name?: string;
	public initials?: string;
	public lastMessageTimestamp: number = -1;
	public isExpired = false;
	public phoneNumbers: PhoneNumberWithDescription[] = [];
	public provider = 'whatsapp';

	constructor(data: any) {
		const payload = data.waba_payload;

		this.waId = data.wa_id;
		this.setName(payload?.profile?.name);

		if (this.waId) {
			this.phoneNumbers = [
				{
					phoneNumber: this.waId,
					description: undefined,
				},
			];
		}

		this.lastMessageTimestamp =
			parseIntSafely(data.last_message_timestamp) ?? -1;
		this.isExpired = this.checkIfExpired();
	}

	setName(name: string) {
		this.name = name;
		this.initials = this.generateInitials(); //data.initials;
	}

	getPastHoursAfterLastMessage() {
		return getPastHoursByTimestamp(this.lastMessageTimestamp);
	}

	checkIfExpired() {
		return this.getPastHoursAfterLastMessage() >= 24;
	}

	generateInitials = () => {
		return generateInitialsHelper(this.name);
	};

	static newInstance() {
		return new PersonModel({});
	}
}

export default PersonModel;
