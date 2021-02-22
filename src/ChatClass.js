import {getPastHoursByTimestamp} from "./DateHelpers";

class ChatClass {

    constructor(data) {
        const contact = data.contact;
        const lastMessage = data.last_message;
        const contactPayload = contact.waba_payload;
        const lastMessagePayload = lastMessage?.waba_payload;

        this.waId = contactPayload.wa_id;
        this.initials = contact.initials;
        this.name = contactPayload.profile.name;
        this.unseenMessages = data.unseen_messages;
        this.lastMessageTimestamp = lastMessagePayload?.timestamp;
        this.lastMessageBody = lastMessagePayload?.text?.body;
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