import { CHAT_KEY_PREFIX } from '@src/Constants';
import { User } from '@src/types/users';
import { Chat, ChatList } from '@src/types/chats';
import {
	isChatAssignedToGroupId,
	isChatAssignedToUser,
	isChatAssignedToUserAnyGroup,
	isChatIncludingTagId,
} from '@src/helpers/ChatHelper';
import { Message } from '@src/types/messages';
import NewMessageList from '@src/interfaces/NewMessageList';

const hasPermission = (currentUser: User, chat: Chat) => {
	const canReadChats = currentUser?.permissions?.can_read_chats;

	switch (canReadChats) {
		case 'all':
			return true;
		case 'user':
			return isChatAssignedToUser(chat, currentUser);
		case 'group':
			return (
				isChatAssignedToUser(chat, currentUser) ||
				isChatAssignedToUserAnyGroup(chat, currentUser)
			);
		default:
			return false;
	}
};

export const filterChat = (
	currentUser: User | undefined,
	chat: Chat,
	newMessages: NewMessageList,
	filterTagId?: number,
	filterAssignedToMe?: boolean,
	filterAssignedGroupId?: number,
	filterUnread?: boolean
) => {
	if (!currentUser) return true;

	if (filterTagId) {
		return isChatIncludingTagId(chat, filterTagId);
	}

	if (filterAssignedToMe) {
		return isChatAssignedToUser(chat, currentUser);
	}

	if (filterAssignedGroupId) {
		return isChatAssignedToGroupId(chat, filterAssignedGroupId);
	}

	if (filterUnread) {
		return (newMessages[chat.contact.wa_id]?.newMessages ?? 0) > 0;
	}

	return true;
};

export const handleChatAssignmentEvent = (
	currentUser: User | undefined,
	chats: ChatList,
	data: { [key: string]: Message }
) => {
	if (!currentUser) {
		console.warn('Current user is empty!', currentUser);
		return;
	}

	let newMissingChats: string[] = [];
	let isChatsChanged = false;

	const canReadChatsAll = currentUser.permissions.can_read_chats === 'all';
	const canReadChatsGroup = currentUser.permissions.can_read_chats === 'group';
	const canReadChatsUser = currentUser.permissions.can_read_chats === 'user';

	const checkIsUserInGroup = (groupId: number) =>
		Boolean(currentUser?.groups.find((group) => group.id === groupId));

	Object.entries(data).forEach((message) => {
		//const msgId = message[0];
		const assignmentData = message[1];
		const assignmentEvent = assignmentData.assignment_event;

		// If user is already able to read all chats
		if (canReadChatsAll) {
			return;
		}

		if (!assignmentEvent) {
			console.warn('Assignment event is missing!', assignmentData);
			return;
		}

		const chatKey = CHAT_KEY_PREFIX + assignmentData.customer_wa_id;
		const isChatLoaded = chats.hasOwnProperty(chatKey);
		const assignedGroup = chats[chatKey]?.assigned_group;
		const isAlreadyAssignedToCurrentUser =
			chats[chatKey]?.assigned_to_user?.id === currentUser.id;

		const queueMissingChat = () =>
			newMissingChats.push(assignmentData.customer_wa_id);

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
