import {getPastHoursByTimestamp} from "./DateHelpers";

class ChatClass {

    constructor(data) {
        const contact = data.contact;
        const payload = contact.waba_payload;

        this.waId = payload.wa_id;
        this.initials = contact.initials;
        this.name = payload.profile.name;
        this.lastMessageTimestamp = contact.last_message;
        this.isExpired = this.checkIfExpired();
    }

    getPastHoursAfterLastMessage() {
        return getPastHoursByTimestamp(this.lastMessageTimestamp);
    }

    checkIfExpired() {
        return this.getPastHoursAfterLastMessage() >= 24;
    }

    getAvatarClassName() {
        return this.initials ? this.initials[0] : '';
    }
}

export default ChatClass;