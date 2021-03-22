import {getPastHoursByTimestamp} from "./DateHelpers";
import {generateInitialsHelper} from "./Helpers";

class ChatClass {

    constructor(data) {
        const contact = data.contact;
        const lastMessage = data.last_message;
        const contactPayload = contact.waba_payload;
        const lastMessagePayload = lastMessage?.waba_payload;

        this.waId = contactPayload.wa_id;
        this.name = contactPayload.profile.name;
        this.initials = this.generateInitials(); //contact.initials;
        this.newMessages = data.new_messages;

        this.setLastMessage(lastMessagePayload);
    }

    generateInitials = () => {
        return generateInitialsHelper(this.name);
    }

    getAvatarClassName() {
        return this.initials ? this.initials[0] : '';
    }

    setLastMessage(lastMessagePayload) {
        this.lastMessage = lastMessagePayload;
        this.lastMessageBody = this.lastMessage?.text?.body;
        this.lastMessageButtonText = lastMessagePayload?.button?.text;
        this.lastMessageCaption = lastMessagePayload?.image?.caption ?? lastMessagePayload?.video?.caption ?? lastMessagePayload?.audio?.caption ?? lastMessagePayload?.document?.caption;
        this.lastMessageType = lastMessagePayload?.type;
        this.lastMessageTimestamp = parseInt(this.lastMessage?.timestamp);
        this.isExpired = this.checkIfExpired();
    }

    getPastHoursAfterLastMessage() {
        return getPastHoursByTimestamp(this.lastMessageTimestamp);
    }

    checkIfExpired() {
        return this.getPastHoursAfterLastMessage() >= 24;
    }
}

export default ChatClass;