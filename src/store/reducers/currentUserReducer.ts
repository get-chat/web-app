import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@src/types/users';

interface CurrentUserState {
	value: User | undefined;
}

const initialState: CurrentUserState = {
	value: undefined,
};

const currentUserSlice = createSlice({
	name: 'currentUser',
	initialState,
	reducers: {
		setCurrentUser: (state, currentUser: PayloadAction<User | undefined>) => {
			state.value = currentUser.payload;
		},
	},
});

export const { setCurrentUser } = currentUserSlice.actions;

export default currentUserSlice.reducer;
