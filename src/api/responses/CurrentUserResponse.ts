import UserModel from '../models/UserModel';

class CurrentUserResponse {
	public currentUser: UserModel;

	constructor(data: any) {
		this.currentUser = new UserModel(data);
	}
}

export default CurrentUserResponse;
