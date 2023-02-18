// @ts-nocheck
import UserModel from '../models/UserModel';

class CurrentUserResponse {
	constructor(data) {
		this.currentUser = new UserModel(data);
	}
}

export default CurrentUserResponse;
