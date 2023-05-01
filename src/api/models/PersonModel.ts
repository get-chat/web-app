import { getPastHoursByTimestamp } from '@src/helpers/DateHelper';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { parseIntSafely } from '@src/helpers/IntegerHelper';
import RecipientInterface from '@src/api/models/RecipientInterface';

class PersonModel implements RecipientInterface {
	public waId?: string;
	public name?: string;
	public initials?: string;
	public lastMessageTimestamp: Number = -1;
	public isExpired = false;

	constructor(data: any) {
		const payload = data.waba_payload;

		this.waId = data.wa_id;

		this.setName(payload?.profile?.name);

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
