// @ts-nocheck
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

export const filterChat = (
	currentUser,
	chat,
	filterAssignedToMe,
	filterAssignedGroup
) => {
	// No filter
	if (!filterAssignedToMe && !filterAssignedGroup) {
		return true;
	}

	// Filtered by both
	if (filterAssignedToMe && filterAssignedGroup) {
		return (
			isChatAssignedToUser(currentUser, chat) ||
			isChatInUsersGroup(currentUser, chat)
		);
	}

	if (filterAssignedToMe) {
		return isChatAssignedToUser(currentUser, chat);
	}

	if (filterAssignedGroup) {
		return isChatInUsersGroup(currentUser, chat);
	}

	return isChatInUsersGroup(currentUser, chat);
};
