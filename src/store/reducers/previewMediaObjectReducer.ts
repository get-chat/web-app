import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	value: undefined,
};

const previewMediaObjectSlice = createSlice({
	name: 'previewMediaObject',
	initialState,
	reducers: {
		setPreviewMediaObject: (state, previewMediaObject) => {
			state.value = previewMediaObject.payload;
		},
	},
});

export const { setPreviewMediaObject } = previewMediaObjectSlice.actions;

export default previewMediaObjectSlice.reducer;
