import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
	isReadOnly: boolean;
	isMessageStatusesVisible: boolean;
	isContactDetailsVisible: boolean;
	isSearchMessagesVisible: boolean;
	isSelectionModeEnabled: boolean;
	isBulkSend: boolean;
	isExportChat: boolean;
}

const initialState: UIState = {
	isReadOnly: false,
	isMessageStatusesVisible: false,
	isContactDetailsVisible: false,
	isSearchMessagesVisible: false,
	isSelectionModeEnabled: false,
	isBulkSend: false,
	isExportChat: false,
};

const closeSections = (state: Draft<UIState>) => {
	state.isMessageStatusesVisible = false;
	state.isContactDetailsVisible = false;
	state.isSearchMessagesVisible = false;
};

export const UISlice = createSlice({
	name: 'UI',
	initialState,
	reducers: {
		setReadOnly: (state, action: PayloadAction<boolean>) => {
			state.isReadOnly = action.payload;
		},
		setMessageStatusesVisible: (state, action: PayloadAction<boolean>) => {
			closeSections(state);
			state.isMessageStatusesVisible = action.payload;
		},
		setContactDetailsVisible: (state, action: PayloadAction<boolean>) => {
			closeSections(state);
			state.isContactDetailsVisible = action.payload;
		},
		setSearchMessagesVisible: (state, action: PayloadAction<boolean>) => {
			closeSections(state);
			state.isSearchMessagesVisible = action.payload;
		},
		setSelectionModeEnabled: (state, action: PayloadAction<boolean>) => {
			state.isSelectionModeEnabled = action.payload;

			if (!action.payload) {
				state.isBulkSend = false;
				state.isExportChat = false;
			}
		},
		setBulkSend: (state, action: PayloadAction<boolean>) => {
			state.isBulkSend = action.payload;
		},
		setExportChat: (state, action: PayloadAction<boolean>) => {
			state.isExportChat = action.payload;
		},

		toggleState: (state, action: PayloadAction<keyof UIState>) => {
			state[action.payload] = !state[action.payload];
		},
		setState: (
			state,
			action: PayloadAction<{ key: keyof UIState; value: boolean }>
		) => {
			state[action.payload.key] = action.payload.value;
		},
	},
});

export const {
	setReadOnly,
	setMessageStatusesVisible,
	setContactDetailsVisible,
	setSearchMessagesVisible,
	setSelectionModeEnabled,
	setBulkSend,
	setExportChat,
} = UISlice.actions;

export default UISlice.reducer;
