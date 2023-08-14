import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
	value: { isReadOnly: boolean; isMessageStatusesVisible: boolean };
}

const initialState: UIState = {
	value: {
		isReadOnly: false,
		isMessageStatusesVisible: false,
	},
};

export const UISlice = createSlice({
	name: 'UI',
	initialState,
	reducers: {
		setReadOnly: (state, action: PayloadAction<boolean>) => {
			state.value.isReadOnly = action.payload;
		},
		setMessageStatusesVisible: (state, action: PayloadAction<boolean>) => {
			state.value.isMessageStatusesVisible = action.payload;
		},
	},
});

export const { setReadOnly, setMessageStatusesVisible } = UISlice.actions;

export default UISlice.reducer;
