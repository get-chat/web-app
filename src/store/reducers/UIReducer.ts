import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';
import { Person } from '@src/types/persons';

interface UIState {
	isReadOnly: boolean;
	isMessageStatusesVisible: boolean;
	isContactDetailsVisible: boolean;
	isSearchMessagesVisible: boolean;
	isAnalyticsVisible: boolean;
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
	isUploadingProfilePhoto: boolean;
	isRefreshingSettings: boolean;
	isBrowserOffline: boolean;
	isWebSocketDisconnected: boolean;
	webSocketDisconnectionCode: number | undefined;
	// Set from the query parameters the backend appends when it sends a user
	// here right after they opened their activation link
	isAccountActivated: boolean;
	activatedUsername: string | undefined;
	// The code of an activation link, while its user is choosing a password
	activationCode: string | undefined;
	// The code of an invite into an inbox (MT 3.6), until accepted or dismissed
	inviteCode: string | undefined;
}

const initialState: UIState = {
	isReadOnly: false,
	isMessageStatusesVisible: false,
	isContactDetailsVisible: false,
	isSearchMessagesVisible: false,
	isAnalyticsVisible: false,
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
	isUploadingProfilePhoto: false,
	isRefreshingSettings: false,
	isBrowserOffline: false,
	isWebSocketDisconnected: false,
	webSocketDisconnectionCode: undefined,
	isAccountActivated: false,
	activatedUsername: undefined,
	activationCode: undefined,
	inviteCode: undefined,
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
		// The initial load's progress only moves forward. Decided here, against
		// the current value: a caller comparing with the value of its own render
		// saw a stale one after logout and login (still 100 from the previous
		// session), so no step was ever dispatched
		advanceLoadingProgress: (state, action: PayloadAction<number>) => {
			state.loadingProgress = Math.max(state.loadingProgress, action.payload);
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
	advanceLoadingProgress,
	setState,
} = UISlice.actions;

export default UISlice.reducer;
