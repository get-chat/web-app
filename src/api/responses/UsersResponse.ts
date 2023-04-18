import UserModel from '@src/api/models/UserModel';

export type UserList = {
	[key: string]: UserModel;
};

class UsersResponse {
	public users: UserList = {};

	constructor(data: any) {
		const users: UserList = {};
		data.results.forEach((userData: any) => {
			users[userData.id] = new UserModel(userData);
		});
		this.users = users;
	}
}

export default UsersResponse;
