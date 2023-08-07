import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
	value: { isReadOnly: boolean };
}

const initialState: UIState = {
	value: {
		isReadOnly: false,
	},
};

export const UISlice = createSlice({
	name: 'UI',
	initialState,
	reducers: {
		setReadOnly: (state, action: PayloadAction<boolean>) => {
			state.value.isReadOnly = action.payload;
		},
	},
});

export default UISlice.reducer;
