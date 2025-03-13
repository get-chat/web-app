import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import PendingMessage from '@src/interfaces/PendingMessage';

interface PendingMessagesState {
	value: PendingMessage[];
}

const initialState: PendingMessagesState = {
	value: [],
};

const pendingMessagesSlice = createSlice({
	name: 'pendingMessages',
	initialState,
	reducers: {
		setPendingMessages: (state, action: PayloadAction<PendingMessage[]>) => {
			state.value = action.payload;
		},
	},
});

export const { setPendingMessages } = pendingMessagesSlice.actions;

export default pendingMessagesSlice.reducer;
