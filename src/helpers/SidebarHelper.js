import {
	CHAT_LIST_TAB_CASE_ALL,
	CHAT_LIST_TAB_CASE_GROUP,
	CHAT_LIST_TAB_CASE_ME,
} from '../Constants';

export const filterChat = (props, tabCase, curChat) => {
	// Filter by case
	switch (tabCase) {
		case CHAT_LIST_TAB_CASE_ALL: {
			return true;
		}
		case CHAT_LIST_TAB_CASE_ME: {
			if (curChat.assignedToUser?.id === props.currentUser.id) {
				return true;
			}
			break;
		}
		case CHAT_LIST_TAB_CASE_GROUP: {
			if (curChat.assignedGroup && props.currentUser.groups) {
				const assignedGroupId = curChat.assignedGroup.id;
				for (let i = 0; i < props.currentUser.groups.length; i++) {
					const group = props.currentUser.groups[i];

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
