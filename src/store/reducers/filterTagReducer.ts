import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import TagModel from '@src/api/models/TagModel';

interface FilterTagState {
	value: TagModel | undefined;
}

const initialState: FilterTagState = {
	value: undefined,
};

const filterTagSlice = createSlice({
	name: 'filterTag',
	initialState,
	reducers: {
		setFilterTag: (state, action: PayloadAction<TagModel | undefined>) => {
			state.value = action.payload;
		},
	},
});

export const { setFilterTag } = filterTagSlice.actions;

export default filterTagSlice.reducer;
