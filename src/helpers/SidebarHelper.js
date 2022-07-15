import {
	SIDEBAR_TAB_CASE_ALL,
	SIDEBAR_TAB_CASE_GROUP,
	SIDEBAR_TAB_CASE_ME,
} from '../Constants';

export const filterChat = (props, tabCase, curChat) => {
	// Filter by tag
	/*if (props.filterTag) {
        if (!curChat.tags) {
            return false;
        }
        let hasTag = false;
        for (let i = 0; i < curChat.tags.length; i++) {
            const curTag = curChat.tags[i];
            if (curTag.id === props.filterTag.id) {
                hasTag = true;
                break;
            }
        }
        if (!hasTag) return false;
    }*/

	// If any of these objects are undefined for any reason: https://sentry.io/organizations/getchat/issues/3426491838
	if (!curChat || !props.currentUser) {
		console.log(
			'Current chat or current user is empty.',
			curChat,
			props.currentUser
		);
		return true;
	}

	// Filter by case
	switch (tabCase) {
		case SIDEBAR_TAB_CASE_ALL: {
			return true;
		}
		case SIDEBAR_TAB_CASE_ME: {
			if (curChat.assignedToUser?.id === props.currentUser.id) {
				return true;
			}
			break;
		}
		case SIDEBAR_TAB_CASE_GROUP: {
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
