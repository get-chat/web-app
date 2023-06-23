import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import TagModel from '@src/api/models/TagModel';

interface TagsState {
	value: TagModel[];
}

const initialState: TagsState = {
	value: [],
};

const tagsSlice = createSlice({
	name: 'tags',
	initialState,
	reducers: {
		setTags: (state, action: PayloadAction<TagModel[]>) => {
			state.value = action.payload;
		},
	},
});

export const { setTags } = tagsSlice.actions;

export default tagsSlice.reducer;
