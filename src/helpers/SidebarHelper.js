import {
	CHAT_LIST_TAB_CASE_ALL,
	CHAT_LIST_TAB_CASE_GROUP,
	CHAT_LIST_TAB_CASE_ME,
} from '../Constants';

const isChatAssignedToUser = (currentUser, chat) => {
	return (
		currentUser?.id !== undefined && chat.assignedToUser?.id === currentUser.id
	);
};

const isChatInUsersGroup = (currentUser, chat) => {
	if (chat.assignedGroup && currentUser?.groups) {
		const assignedGroupId = chat.assignedGroup.id;
		for (let i = 0; i < currentUser.groups.length; i++) {
			const group = currentUser.groups[i];

			if (group?.id === assignedGroupId) {
				return true;
			}
		}
	}

	return false;
};

const hasPermission = (currentUser, chat) => {
	const canReadChats = currentUser?.permissions?.canReadChats;

	switch (canReadChats) {
		case 'all':
			return true;
		case 'user':
			return isChatAssignedToUser(currentUser, chat);
		case 'group':
			return (
				isChatAssignedToUser(currentUser, chat) ||
				isChatInUsersGroup(currentUser, chat)
			);
		default:
			return false;
	}
};

export const filterChat = (currentUser, tabCase, chat) => {
	// Filter by case
	switch (tabCase) {
		case CHAT_LIST_TAB_CASE_ALL: {
			return currentUser?.isAdmin || hasPermission(currentUser, chat);
		}
		case CHAT_LIST_TAB_CASE_ME: {
			return isChatAssignedToUser(currentUser, chat);
		}
		case CHAT_LIST_TAB_CASE_GROUP: {
			return isChatInUsersGroup(currentUser, chat);
		}
		default:
			return false;
	}
};
