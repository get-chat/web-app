import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WaIdState {
	value?: string;
}

const initialState: WaIdState = {
	value: undefined,
};

const waIdSlice = createSlice({
	name: 'waId',
	initialState,
	reducers: {
		setWaId: (state, action: PayloadAction<string | undefined>) => {
			state.value = action.payload;
		},
		clearWaId: (state) => {
			state.value = undefined;
		},
	},
});

export const { setWaId, clearWaId } = waIdSlice.actions;

export default waIdSlice.reducer;
