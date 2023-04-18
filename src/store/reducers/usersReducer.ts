import { createSlice } from '@reduxjs/toolkit';
import { UserList } from '@src/api/responses/UsersResponse';

interface UsersState {
	value: UserList;
}

const initialState: UsersState = {
	value: {},
};

export const usersSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {
		setUsers: (state, users) => {
			state.value = users.payload;
		},
	},
});

// Action creators are generated for each case reducer function
export const { setUsers } = usersSlice.actions;

export default usersSlice.reducer;
