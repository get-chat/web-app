import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	value: undefined,
};

const chatsCountSlice = createSlice({
	name: 'chatsCount',
	initialState,
	reducers: {
		setChatsCount: (state, chatsCount) => {
			state.value = chatsCount.payload;
		},
	},
});

export const { setChatsCount } = chatsCountSlice.actions;

export default chatsCountSlice.reducer;
