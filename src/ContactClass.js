class ContactClass {

    constructor(data) {
        const payload = data.waba_payload;

        this.waId = data.wa_id;
        this.initials = data.initials;
        this.name = payload.profile.name;
        this.lastMessageTimestamp = data.last_message;
        this.isExpired = true;
    }

}

export default ContactClass;