import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	value: false,
};

const isUserAvailabilityFeatureEnabledSlice = createSlice({
	name: 'isUserAvailabilityFeatureEnabled',
	initialState,
	reducers: {
		setIsUserAvailabilityFeatureEnabled: (state, isEnabled) => {
			state.value = isEnabled.payload;
		},
	},
});

export const { setIsUserAvailabilityFeatureEnabled } =
	isUserAvailabilityFeatureEnabledSlice.actions;

export default isUserAvailabilityFeatureEnabledSlice.reducer;
