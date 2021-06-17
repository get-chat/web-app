export const filterChat = (props, tabCase, curChat) => {
    // Filter by tag
    if (props.filterTag) {
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
    }

    // Filter by case
    switch (tabCase) {
        case "all": {
            return true;
        }
        case "me": {
            if (curChat.assignedToUser?.id === props.currentUser.id) {
                return true;
            }
            break;
        }
        case "group": {
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
}