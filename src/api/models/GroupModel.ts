class GroupModel {
	public id: Number = 0;
	public name: string = '';

	constructor(data: any) {
		if (!data) return;

		this.id = data.id;
		this.name = data.name;
	}
}

export default GroupModel;
