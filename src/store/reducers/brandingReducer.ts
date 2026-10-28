import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Branding } from '@src/types/branding';

interface BrandingState {
	value: Branding | undefined;
}

const initialState: BrandingState = {
	value: undefined,
};

const brandingSlice = createSlice({
	name: 'branding',
	initialState,
	reducers: {
		setBranding: (state, branding: PayloadAction<Branding | undefined>) => {
			state.value = branding.payload;
		},
	},
});

export const { setBranding } = brandingSlice.actions;

export default brandingSlice.reducer;
