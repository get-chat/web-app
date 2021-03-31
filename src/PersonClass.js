import {getPastHoursByTimestamp} from "./DateHelpers";
import {generateInitialsHelper} from "./Helpers";

class PersonClass {

    constructor(data) {
        const payload = data.waba_payload;

        this.waId = data.wa_id;
        this.name = payload.profile.name;
        this.initials = this.generateInitials(); //data.initials;
        this.lastMessageTimestamp = data.last_message_timestamp ? parseInt(data.last_message_timestamp) : -1;
        this.isExpired = this.checkIfExpired();
    }

    getPastHoursAfterLastMessage() {
        return getPastHoursByTimestamp(this.lastMessageTimestamp);
    }

    checkIfExpired() {
        return this.getPastHoursAfterLastMessage() >= 24;
    }

    generateInitials = () => {
        return generateInitialsHelper(this.name);
    }

    getAvatarClassName() {
        return this.initials ? this.initials[0] : '';
    }
}

export default PersonClass;