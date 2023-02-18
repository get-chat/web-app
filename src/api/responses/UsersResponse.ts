// @ts-nocheck
import UserModel from '../models/UserModel';

class UsersResponse {
	constructor(data) {
		const users = {};
		data.results.forEach((userData) => {
			users[userData.id] = new UserModel(userData);
		});
		this.users = users;
	}
}

export default UsersResponse;
