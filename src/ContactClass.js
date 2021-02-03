class ContactClass {

    constructor(data) {
        const payload = data.waba_payload;

        this.waId = data.wa_id;
        this.initials = data.initials;
        this.name = payload.profile.name;
        this.lastMessageTimestamp = data.last_message;

        const pastHours = this.getPastHoursAfterLastMessage();
        this.isExpired = pastHours >= 24;

        // TODO: Change it to data from server
        //this.isExpired = Math.random() < 0.5;
    }

    getPastHoursAfterLastMessage() {
        return 0;

        /*const lastMessageDate = new Date(this.lastMessageTimestamp * 1000);
        const milliseconds = Math.abs(lastMessageDate - new Date());
        const hours = milliseconds / 36e5;

        console.log(hours);*/
    }

}

export default ContactClass;