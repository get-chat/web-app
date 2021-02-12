class UnseenMessageClass {

    constructor(data) {
        this.waId = data.contact.waba_payload.wa_id;
        this.unseenMessages = data.unseen_messages;
    }

}

export default UnseenMessageClass;