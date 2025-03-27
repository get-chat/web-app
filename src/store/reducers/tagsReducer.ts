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
	},
});

export const { setTags } = tagsSlice.actions;

export default tagsSlice.reducer;
