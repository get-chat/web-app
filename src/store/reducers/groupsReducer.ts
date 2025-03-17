import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GroupList } from '@src/types/groups';

interface GroupsState {
	value: GroupList;
}

const initialState: GroupsState = {
	value: {},
};

const groupsSlice = createSlice({
	name: 'groups',
	initialState,
	reducers: {
		setGroups: (state, action: PayloadAction<GroupList>) => {
			state.value = action.payload;
		},
	},
});

export const { setGroups } = groupsSlice.actions;

export default groupsSlice.reducer;
