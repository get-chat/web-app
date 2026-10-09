import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tenant } from '@src/types/tenants';

// Switching to another inbox: every per-inbox slice goes back to its initial
// state (see store/index.ts) and Main remounts under the new generation
export const resetInboxState = createAction('inboxes/reset');

interface InboxesState {
	// The account's inboxes (MT 3.6); one or none means no switcher
	tenants: Tenant[];
	currentTenantId: string | undefined;
	// Main's key: bumped by every switch so it mounts afresh
	generation: number;
}

const initialState: InboxesState = {
	tenants: [],
	currentTenantId: undefined,
	generation: 0,
};

const inboxesSlice = createSlice({
	name: 'inboxes',
	initialState,
	reducers: {
		setTenants: (
			state,
			action: PayloadAction<{
				tenants: Tenant[];
				currentTenantId: string | undefined;
			}>
		) => {
			state.tenants = action.payload.tenants;
			state.currentTenantId = action.payload.currentTenantId;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(resetInboxState, (state) => {
			state.generation += 1;
		});
	},
});

export const { setTenants } = inboxesSlice.actions;

export default inboxesSlice.reducer;
