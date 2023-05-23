import GroupModel from '@src/api/models/GroupModel';

export type GroupList = {
	[key: string]: GroupModel;
};

class UsersResponse {
	public groups: GroupList = {};

	constructor(data: any) {
		const groups: GroupList = {};
		data.results.forEach((groupData: any) => {
			groups[groupData.id] = new GroupModel(groupData);
		});
		this.groups = groups;
	}
}

export default UsersResponse;
