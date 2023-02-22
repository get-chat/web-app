import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	value: [],
};

const tagsSlice = createSlice({
	name: 'tags',
	initialState,
	reducers: {
		setTags: (state, tags) => {
			state.value = tags.payload;
		},
	},
});

export const { setTags } = tagsSlice.actions;

export default tagsSlice.reducer;
