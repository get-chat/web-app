import UserModel from '@src/api/models/UserModel';
import ChatModel from '@src/api/models/ChatModel';
import { CHAT_KEY_PREFIX } from '@src/Constants';
import ChatList from '@src/interfaces/ChatList';

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

export const handleChatAssignmentEvent = (
	currentUser: UserModel | undefined,
	chats: ChatList,
	data: any
) => {
	if (!currentUser) {
		console.warn('Current user is empty!', currentUser);
		return;
	}

	let newMissingChats: string[] = [];
	let isChatsChanged = false;

	const canReadChatsAll = currentUser.permissions.canReadChats === 'all';
	const canReadChatsGroup = currentUser.permissions.canReadChats === 'group';
	const canReadChatsUser = currentUser.permissions.canReadChats === 'user';

	const checkIsUserInGroup = (groupId: number) =>
		Boolean(currentUser?.groups.find((group) => group.id === groupId));

	Object.entries(data).forEach((message) => {
		//const msgId = message[0];
		const assignmentData: any = message[1];
		const assignmentEvent = assignmentData.assignmentEvent;

		// If user is already able to read all chats
		if (canReadChatsAll) {
			return;
		}

		if (!assignmentEvent) {
			console.warn('Assignment event is missing!', assignmentData);
			return;
		}

		const chatKey = CHAT_KEY_PREFIX + assignmentData.waId;
		const isChatLoaded = chats.hasOwnProperty(chatKey);
		const assignedGroup = chats[chatKey]?.assignedGroup;
		const isAlreadyAssignedToCurrentUser =
			chats[chatKey]?.assignedToUser?.id === currentUser.id;

		const queueMissingChat = () => newMissingChats.push(assignmentData.waId);

		const deleteChat = () => {
			delete chats[chatKey];
			isChatsChanged = true;
		};

		// Group has changed
		if (assignmentEvent.assigned_group_set) {
			if (canReadChatsGroup) {
				const isGroupMatch = checkIsUserInGroup(
					assignmentEvent.assigned_group_set.id
				);

				if (isChatLoaded) {
					if (!isGroupMatch && !isAlreadyAssignedToCurrentUser) deleteChat();
				} else {
					if (isGroupMatch) {
						queueMissingChat();
					}
				}
			}
		}

		// Group was cleared
		if (assignmentEvent.assigned_group_was_cleared) {
			if (isChatLoaded && canReadChatsGroup && !isAlreadyAssignedToCurrentUser)
				deleteChat();
		}

		// User has changed
		if (assignmentEvent.assigned_to_user_set) {
			const isAssignedToCurrentUser =
				assignmentEvent.assigned_to_user_set.id === currentUser.id;
			if (isChatLoaded) {
				if (canReadChatsGroup) {
					if (!assignedGroup || !checkIsUserInGroup(assignedGroup.id)) {
						deleteChat();
					}
				} else if (canReadChatsUser && !isAssignedToCurrentUser) {
					deleteChat();
				}
			} else {
				if (isAssignedToCurrentUser) queueMissingChat();
			}
		}

		// User was cleared
		if (assignmentEvent.assigned_to_user_was_cleared) {
			if (isChatLoaded) {
				if (canReadChatsGroup) {
					if (!assignedGroup || !checkIsUserInGroup(assignedGroup.id)) {
						deleteChat();
					}
				} else if (canReadChatsUser) {
					deleteChat();
				}
			}
		}
	});

	return {
		isChatsChanged,
		chats,
		newMissingChats,
	};
};
