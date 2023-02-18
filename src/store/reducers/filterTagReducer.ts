import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	value: undefined,
};

export const filterTagSlice = createSlice({
	name: 'filterTag',
	initialState,
	reducers: {
		setFilterTag: (state, filterTag) => {
			state.value = filterTag.payload;
		},
	},
});

export const { setFilterTag } = filterTagSlice.actions;

export default filterTagSlice.reducer;
