import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	value: false,
};

const isRefreshingTemplatesSlice = createSlice({
	name: 'isRefreshingTemplates',
	initialState,
	reducers: {
		setIsRefreshingTemplates: (state, isRefreshing) => {
			state.value = isRefreshing.payload;
		},
	},
});

export const { setIsRefreshingTemplates } = isRefreshingTemplatesSlice.actions;

export default isRefreshingTemplatesSlice.reducer;
