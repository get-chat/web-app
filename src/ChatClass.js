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
        this.lastMessage = lastMessagePayload;
        this.lastMessageBody = lastMessagePayload?.text?.body;
        this.lastMessageTimestamp = parseInt(lastMessagePayload?.timestamp ?? contact?.last_message_timestamp);
        this.isExpired = this.checkIfExpired();
    }

    setLastMessage(lastMessagePayload) {
        this.lastMessage = lastMessagePayload;
        this.lastMessageBody = this.lastMessage?.text?.body;
        this.lastMessageTimestamp = parseInt(this.lastMessage?.timestamp);
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