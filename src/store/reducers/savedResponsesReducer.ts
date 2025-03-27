import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SavedResponse } from '@src/types/savedResponses';

interface SavedResponsesState {
	value: SavedResponse[];
}

const initialState: SavedResponsesState = {
	value: [],
};

const savedResponsesSlice = createSlice({
	name: 'savedResponses',
	initialState,
	reducers: {
		setSavedResponses: (state, action: PayloadAction<SavedResponse[]>) => {
			state.value = action.payload;
		},
	},
});

// Action creators are generated for each case reducer function
export const { setSavedResponses } = savedResponsesSlice.actions;

export default savedResponsesSlice.reducer;
