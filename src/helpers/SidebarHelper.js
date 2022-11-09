import {
	CHAT_LIST_TAB_CASE_ALL,
	CHAT_LIST_TAB_CASE_GROUP,
	CHAT_LIST_TAB_CASE_ME,
} from '../Constants';

export const filterChat = (currentUser, tabCase, curChat) => {
	// Filter by case
	switch (tabCase) {
		case CHAT_LIST_TAB_CASE_ALL: {
			console.log('test');
			return true;
		}
		case CHAT_LIST_TAB_CASE_ME: {
			if (curChat.assignedToUser?.id === currentUser.id) {
				return true;
			}
			break;
		}
		case CHAT_LIST_TAB_CASE_GROUP: {
			if (curChat.assignedGroup && currentUser.groups) {
				const assignedGroupId = curChat.assignedGroup.id;
				for (let i = 0; i < currentUser.groups.length; i++) {
					const group = currentUser.groups[i];

					if (group?.id === assignedGroupId) {
						return true;
					}
				}
			}
			break;
		}
		default: {
			break;
		}
	}

	return false;
};
