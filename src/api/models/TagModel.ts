class TagModel {
	public id: number;
	public name: string;
	public color: string;
	public taggingId: number | null;

	constructor(data: any) {
		this.id = data.id;
		this.name = data.name;
		this.color = data.web_inbox_color;
		this.taggingId = data.tagging_id;
	}
}

export default TagModel;
