import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	value: {},
};

export const templatesSlice = createSlice({
	name: 'templates',
	initialState,
	reducers: {
		setTemplates: (state, templates) => {
			state.value = templates.payload;
		},
	},
});

export const { setTemplates } = templatesSlice.actions;

export default templatesSlice.reducer;
