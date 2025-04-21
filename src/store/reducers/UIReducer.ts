import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { Person } from '@src/types/persons';

interface UIState {
	isReadOnly: boolean;
	isMessageStatusesVisible: boolean;
	isContactDetailsVisible: boolean;
	isSearchMessagesVisible: boolean;
	isSelectionModeEnabled: boolean;
	isExportChat: boolean;
	loadingProgress: number;
	loadingComponent: string;
	hasFailedMessages: boolean;
	isBlurred: boolean;
	isSendingPendingMessages: boolean;
	isLoadingTemplates: boolean;
	isUploadingMedia: boolean;
	isTemplatesFailed: boolean;
	lastSendAttemptAt: Date | undefined;
	selectedTags: number[];
	selectedChats: string[];
	chosenContact: Person | undefined;
	isChatAssignmentVisible: boolean;
	isInitialResourceFailed: boolean;
	isUploadRecipientsCSVVisible: boolean;
	isTemplatesVisible: boolean;
	isSavedResponsesVisible: boolean;
	isInteractiveMessagesVisible: boolean;
}

const initialState: UIState = {
	isReadOnly: false,
	isMessageStatusesVisible: false,
	isContactDetailsVisible: false,
	isSearchMessagesVisible: false,
	isSelectionModeEnabled: false,
	isExportChat: false,
	loadingProgress: 0,
	loadingComponent: '',
	hasFailedMessages: false,
	isBlurred: false,
	isSendingPendingMessages: false,
	isLoadingTemplates: true,
	isUploadingMedia: false,
	isTemplatesFailed: false,
	lastSendAttemptAt: undefined,
	selectedTags: [],
	selectedChats: [],
	chosenContact: undefined,
	isChatAssignmentVisible: false,
	isInitialResourceFailed: false,
	isUploadRecipientsCSVVisible: false,
	isTemplatesVisible: false,
	isSavedResponsesVisible: false,
	isInteractiveMessagesVisible: false,
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
		setSearchMessagesVisible: (state, action: PayloadAction<boolean>) => {
			closeSections(state);
			state.isSearchMessagesVisible = action.payload;
		},
		setSelectionModeEnabled: (state, action: PayloadAction<boolean>) => {
			state.isSelectionModeEnabled = action.payload;

			if (!action.payload) {
				state.isExportChat = false;
			}
		},
		setExportChat: (state, action: PayloadAction<boolean>) => {
			state.isExportChat = action.payload;
		},

		toggleState: (state, action: PayloadAction<keyof UIState>) => {
			if (typeof state[action.payload] === 'boolean') {
				return { ...state, [action.payload]: !state[action.payload] };
			}
			return state;
		},
		setState: (state, action: PayloadAction<Partial<UIState>>) => {
			return { ...state, ...action.payload };
		},
	},
});

export const {
	setReadOnly,
	setSearchMessagesVisible,
	setSelectionModeEnabled,
	setExportChat,
	toggleState,
	setState,
} = UISlice.actions;

export default UISlice.reducer;
