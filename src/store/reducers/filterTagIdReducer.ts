import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterTagIdState {
	value: number | undefined;
}

const initialState: FilterTagIdState = {
	value: undefined,
};

const filterTagIdSlice = createSlice({
	name: 'filterTagId',
	initialState,
	reducers: {
		setFilterTagId: (state, action: PayloadAction<number | undefined>) => {
			state.value = action.payload;
		},
	},
});

export const { setFilterTagId } = filterTagIdSlice.actions;

export default filterTagIdSlice.reducer;
