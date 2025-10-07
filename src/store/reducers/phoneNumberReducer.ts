import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PhoneNumberState {
	value?: string;
}

const initialState: PhoneNumberState = {
	value: undefined,
};

const phoneNumberSlice = createSlice({
	name: 'phoneNumber',
	initialState,
	reducers: {
		setPhoneNumber: (state, action: PayloadAction<string | undefined>) => {
			state.value = action.payload;
		},
		clearPhoneNumber: (state) => {
			state.value = undefined;
		},
	},
});

export const { setPhoneNumber, clearPhoneNumber } = phoneNumberSlice.actions;

export default phoneNumberSlice.reducer;
