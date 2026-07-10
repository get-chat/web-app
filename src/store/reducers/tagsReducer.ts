import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tag } from '@src/types/tags';

interface TagsState {
	value: Tag[];
}

const initialState: TagsState = {
	value: [],
};

const tagsSlice = createSlice({
	name: 'tags',
	initialState,
	reducers: {
		setTags: (state, action: PayloadAction<Tag[]>) => {
			state.value = action.payload;
		},
		addTag: (state, action: PayloadAction<Tag>) => {
			if (!state.value.some((tag) => tag.id === action.payload.id)) {
				state.value = [...state.value, action.payload];
			}
		},
	},
});

export const { setTags, addTag } = tagsSlice.actions;

export default tagsSlice.reducer;
