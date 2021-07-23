import dompurify from "dompurify";

class SavedResponseClass {

    constructor(data) {
        this.id = data.id;
        this.text = data.text;
        this.timestamp = data.timestamp;
    }

    purify() {
        const sanitizer = dompurify.sanitize;

        if (this.text) {
            this.text = sanitizer(this.text);
        }
    }
}

export default SavedResponseClass;