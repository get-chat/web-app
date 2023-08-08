import UserModel from '@src/api/models/UserModel';
import ChatModel from '@src/api/models/ChatModel';

const hasPermission = (currentUser: UserModel, chat: ChatModel) => {
	const canReadChats = currentUser?.permissions?.canReadChats;

	switch (canReadChats) {
		case 'all':
			return true;
		case 'user':
			return chat.isAssignedToUser(currentUser);
		case 'group':
			return (
				chat.isAssignedToUser(currentUser) ||
				chat.isAssignedToUserAnyGroup(currentUser)
			);
		default:
			return false;
	}
};

export const filterChat = (
	currentUser: UserModel | undefined,
	chat: ChatModel,
	filterTagId?: number,
	filterAssignedToMe?: boolean,
	filterAssignedGroupId?: number
) => {
	if (!currentUser) return true;

	if (filterTagId) {
		return chat.hasTag(filterTagId);
	}

	if (filterAssignedToMe) {
		return chat.isAssignedToUser(currentUser);
	}

	if (filterAssignedGroupId) {
		return chat.isAssignedToGroup(filterAssignedGroupId);
	}

	return true;
};
