import UserModel from '@src/api/models/UserModel';
import GroupModel from '@src/api/models/GroupModel';

class ChatAssignmentResponse {
	public assignedUser?: number | null;
	public assignedGroup?: number | null;

	constructor(data: any) {
		if (!data) return;

		this.assignedUser = data.assigned_to_user;
		this.assignedGroup = data.assigned_group;
	}
}

export default ChatAssignmentResponse;
