import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	value: false,
};

const isUserAvailableSlice = createSlice({
	name: 'isUserAvailable',
	initialState,
	reducers: {
		setIsUserAvailable: (state, isUserAvailable) => {
			state.value = isUserAvailable.payload;
		},
	},
});

export const { setIsUserAvailable } = isUserAvailableSlice.actions;

export default isUserAvailableSlice.reducer;
