import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	value: {},
};

const currentUserSlice = createSlice({
	name: 'currentUser',
	initialState,
	reducers: {
		setCurrentUser: (state, currentUser) => {
			state.value = currentUser.payload;
		},
	},
});

export const { setCurrentUser } = currentUserSlice.actions;

export default currentUserSlice.reducer;
