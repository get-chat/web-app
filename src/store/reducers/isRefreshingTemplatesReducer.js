import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	value: false,
};

export const isRefreshingTemplatesSlice = createSlice({
	name: 'chatsCount',
	initialState,
	reducers: {
		setIsRefreshingTemplates: (state, isRefreshing) => {
			state.value = isRefreshing.payload;
		},
	},
});

export const { setIsRefreshingTemplates } = isRefreshingTemplatesSlice.actions;

export default isRefreshingTemplatesSlice.reducer;
