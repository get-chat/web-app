import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tag } from '@src/types/tags';

interface TagsState {
	value: Tag[];
}

const initialState: TagsState = {
	value: [],
};

const currentChatTagsSlice = createSlice({
	name: 'currentChatTags',
	initialState,
	reducers: {
		setCurrentChatTags: (state, action: PayloadAction<Tag[]>) => {
			state.value = action.payload;
		},
		addCurrentChatTag: (state, action: PayloadAction<Tag>) => {
			const tagExists = state.value.some((tag) => tag.id === action.payload.id);
			if (!tagExists) {
				state.value.push(action.payload);
			}
		},
		removeCurrentChatTag: (state, action: PayloadAction<Tag>) => {
			state.value = state.value.filter((tag) => tag.id !== action.payload.id);
		},
	},
});

export const { setCurrentChatTags, addCurrentChatTag, removeCurrentChatTag } =
	currentChatTagsSlice.actions;

export default currentChatTagsSlice.reducer;
