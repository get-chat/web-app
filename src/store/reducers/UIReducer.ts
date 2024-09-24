import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
	value: {
		isReadOnly: boolean;
		isMessageStatusesVisible: boolean;
		isContactDetailsVisible: boolean;
		isSearchMessagesVisible: boolean;
		isSelectionModeEnabled: boolean;
	};
}

const initialState: UIState = {
	value: {
		isReadOnly: false,
		isMessageStatusesVisible: false,
		isContactDetailsVisible: false,
		isSearchMessagesVisible: false,
		isSelectionModeEnabled: false,
	},
};

const closeSections = (state: Draft<UIState>) => {
	state.value.isMessageStatusesVisible = false;
	state.value.isContactDetailsVisible = false;
	state.value.isSearchMessagesVisible = false;
};

export const UISlice = createSlice({
	name: 'UI',
	initialState,
	reducers: {
		setReadOnly: (state, action: PayloadAction<boolean>) => {
			state.value.isReadOnly = action.payload;
		},
		setMessageStatusesVisible: (state, action: PayloadAction<boolean>) => {
			closeSections(state);
			state.value.isMessageStatusesVisible = action.payload;
		},
		setContactDetailsVisible: (state, action: PayloadAction<boolean>) => {
			closeSections(state);
			state.value.isContactDetailsVisible = action.payload;
		},
		setSearchMessagesVisible: (state, action: PayloadAction<boolean>) => {
			closeSections(state);
			state.value.isSearchMessagesVisible = action.payload;
		},
		setSelectionModeEnabled: (state, action: PayloadAction<boolean>) => {
			state.value.isSelectionModeEnabled = action.payload;
		},
	},
});

export const {
	setReadOnly,
	setMessageStatusesVisible,
	setContactDetailsVisible,
	setSearchMessagesVisible,
	setSelectionModeEnabled,
} = UISlice.actions;

export default UISlice.reducer;
