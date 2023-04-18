import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	value: {},
};

export const savedResponsesSlice = createSlice({
	name: 'savedResponses',
	initialState,
	reducers: {
		setSavedResponses: (state, savedResponses) => {
			state.value = savedResponses.payload;
		},
	},
});

// Action creators are generated for each case reducer function
export const { setSavedResponses } = savedResponsesSlice.actions;

export default savedResponsesSlice.reducer;
