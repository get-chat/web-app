import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CurrentTenant } from '@src/types/tenants';

interface CurrentTenantState {
	value: CurrentTenant | undefined;
}

const initialState: CurrentTenantState = {
	value: undefined,
};

const currentTenantSlice = createSlice({
	name: 'currentTenant',
	initialState,
	reducers: {
		setCurrentTenant: (
			state,
			currentTenant: PayloadAction<CurrentTenant | undefined>
		) => {
			state.value = currentTenant.payload;
		},
	},
});

export const { setCurrentTenant } = currentTenantSlice.actions;

export default currentTenantSlice.reducer;
