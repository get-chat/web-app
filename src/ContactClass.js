import moment from "moment";

class ContactClass {

    constructor(data) {
        const payload = data.waba_payload;

        this.waId = data.wa_id;
        this.initials = data.initials;
        this.name = payload.profile.name;
        this.lastMessageTimestamp = data.last_message;
        this.isExpired = this.checkIfExpired();
    }

    getPastHoursAfterLastMessage() {
        const momentDate = moment.unix(this.lastMessageTimestamp);
        const curDate = moment(new Date());
        return curDate.diff(momentDate, 'hours');
    }

    checkIfExpired() {
        return this.getPastHoursAfterLastMessage() >= 24;
    }

    getAvatarClassName() {
        return this.initials ? this.initials[0] : '';
    }
}

export default ContactClass;