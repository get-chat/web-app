import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CHAT_KEY_PREFIX } from '@src/Constants';
import { ChatList } from '@src/types/chats';

interface ChatsState {
	value: ChatList;
}

const initialState: ChatsState = {
	value: {},
};

const chatsSlice = createSlice({
	name: 'chats',
	initialState,
	reducers: {
		setChats: (state, chats: PayloadAction<ChatList>) => {
			state.value = chats.payload;
		},
		addChats: (state, chats: PayloadAction<ChatList>) => {
			state.value = { ...state.value, ...chats.payload };
		},
		setChatAssignment: (state, action) => {
			const chatKey = CHAT_KEY_PREFIX + action.payload?.waId;
			const existingChat = state.value[chatKey];
			if (existingChat) {
				const assignmentEvent = action.payload?.assignmentEvent;

				if (assignmentEvent) {
					if (assignmentEvent.assigned_to_user_set) {
						existingChat.assigned_to_user =
							assignmentEvent.assigned_to_user_set;
					}

					if (assignmentEvent.assigned_to_user_was_cleared) {
						existingChat.assigned_to_user = undefined;
					}

					if (assignmentEvent.assigned_group_set) {
						existingChat.assigned_group = assignmentEvent.assigned_group_set;
					}

					if (assignmentEvent.assigned_group_was_cleared) {
						existingChat.assigned_group = undefined;
					}

					state.value[chatKey] = existingChat;
					// Trigger update
					state.value = { ...state.value };
				}
			}
		},
		setChatTagging: (state, action) => {
			const chatKey = CHAT_KEY_PREFIX + action.payload?.waId;
			const existingChat = state.value[chatKey];
			if (existingChat) {
				const taggingEvent = action.payload?.taggingEvent;

				if (taggingEvent.action === 'added') {
					existingChat.tags.push(taggingEvent.tag);
				} else if (taggingEvent.action === 'removed') {
					existingChat.tags = existingChat.tags.filter((tag) => {
						return tag.id !== taggingEvent.tag.id;
					});
				}

				state.value[chatKey] = existingChat;
				// Trigger update
				state.value = { ...state.value };
			}
		},
		setChatResolved: (state, action) => {
			const chatKey = CHAT_KEY_PREFIX + action.payload?.waId;
			const existingChat = state.value[chatKey];
			if (existingChat) {
				const resolvedEvent = action.payload?.resolvedEvent;

				existingChat.contact.resolved = resolvedEvent.resolved;

				state.value[chatKey] = existingChat;
				// Trigger update
				state.value = { ...state.value };
			}
		},
	},
});

// Action creators are generated for each case reducer function
export const {
	setChats,
	addChats,
	setChatAssignment,
	setChatTagging,
	setChatResolved,
} = chatsSlice.actions;

export default chatsSlice.reducer;
