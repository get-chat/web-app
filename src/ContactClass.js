class ContactClass {

    constructor(data) {
        const payload = data.waba_payload;

        this.waId = data.wa_id;
        this.initials = data.initials;
        this.name = payload.profile.name;
        this.lastMessageTimestamp = data.last_message;

        // TODO: Change it to data from server
        this.isExpired = Math.random() < 0.5;
    }

}

export default ContactClass;