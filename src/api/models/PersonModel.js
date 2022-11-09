import DateHelper from '../../helpers/DateHelper';
import GenericHelper from '../../helpers/GenericHelper';

class PersonModel {
	constructor(data) {
		const payload = data.waba_payload;

		this.waId = data.wa_id;

		this.setName(payload?.profile?.name);

		this.lastMessageTimestamp = data.last_message_timestamp
			? parseInt(data.last_message_timestamp)
			: -1;
		this.isExpired = this.checkIfExpired();
	}

	setName(name) {
		this.name = name;
		this.initials = this.generateInitials();
	}

	getPastHoursAfterLastMessage() {
		return DateHelper.getPastHoursByTimestamp(this.lastMessageTimestamp);
	}

	checkIfExpired() {
		return this.getPastHoursAfterLastMessage() >= 24;
	}

	generateInitials = () => {
		return GenericHelper.generateInitialsHelper(this.name);
	};

	static newInstance() {
		return new PersonModel({});
	}
}

export default PersonModel;
