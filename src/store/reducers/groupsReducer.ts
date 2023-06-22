import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import GroupModel from '@src/api/models/GroupModel';

interface GroupsState {
	value: GroupModel[];
}

const initialState: GroupsState = {
	value: [],
};

const groupsSlice = createSlice({
	name: 'groups',
	initialState,
	reducers: {
		setGroups: (state, action: PayloadAction<GroupModel[]>) => {
			state.value = action.payload;
		},
	},
});

export const { setGroups } = groupsSlice.actions;

export default groupsSlice.reducer;
