class ChosenFile {
    constructor(data) {
        this.fileURL = URL.createObjectURL(data);
        this.file = data;
    }
}

export default ChosenFile;