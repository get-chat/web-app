class UnsupportedFileClass {
	public name: string;
	public link: string;
	public mimeType: string;

	constructor(data: any) {
		this.name = data.name;
		this.link = data.link;
		this.mimeType = data.mimeType;
	}
}

export default UnsupportedFileClass;
