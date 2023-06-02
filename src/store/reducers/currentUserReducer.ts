import { createSlice } from '@reduxjs/toolkit';
import UserModel from '@src/api/models/UserModel';

interface CurrentUserState {
	value: UserModel | undefined;
}

const initialState: CurrentUserState = {
	value: undefined,
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
