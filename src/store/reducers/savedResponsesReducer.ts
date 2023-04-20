import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SavedResponseList } from '@src/api/responses/SavedResponsesResponse';

interface SavedResponsesState {
	value: SavedResponseList;
}

const initialState: SavedResponsesState = {
	value: {},
};

const savedResponsesSlice = createSlice({
	name: 'savedResponses',
	initialState,
	reducers: {
		setSavedResponses: (state, action: PayloadAction<SavedResponseList>) => {
			state.value = action.payload;
		},
	},
});

// Action creators are generated for each case reducer function
export const { setSavedResponses } = savedResponsesSlice.actions;

export default savedResponsesSlice.reducer;
