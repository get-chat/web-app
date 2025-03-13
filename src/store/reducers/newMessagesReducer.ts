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
	},
});

export const { setNewMessages } = newMessagesSlice.actions;

export default newMessagesSlice.reducer;
