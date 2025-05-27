import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import NewMessageList from '@src/interfaces/NewMessageList';

interface NewMessagesState {
	value: NewMessageList;
}

const initialState: NewMessagesState = {
	value: {},
};

const newMessagesSlice = createSlice({
	name: 'newMessages',
	initialState,
	reducers: {
		setNewMessages: (state, action: PayloadAction<NewMessageList>) => {
			state.value = action.payload;
		},
		mergeNewMessages: (state, action: PayloadAction<NewMessageList>) => {
			state.value = { ...state.value, ...action.payload };
		},
	},
});

export const { setNewMessages, mergeNewMessages } = newMessagesSlice.actions;

export default newMessagesSlice.reducer;
