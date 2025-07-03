export const useAppSelector = jest.fn((selector) =>
	selector({
		UI: {
			isReadOnly: false,
			isSendingPendingMessages: false,
			isTemplatesVisible: false,
			isSavedResponsesVisible: false,
			isInteractiveMessagesVisible: false,
		},
		pendingMessages: { value: [] },
		newMessages: { value: {} },
		currentUser: { value: { id: 1, username: 'testuser' } },
		users: { value: {} },
		templates: { value: {} },
		savedResponses: { value: {} },
		previewMediaObject: { value: null },
	})
);
export const useAppDispatch = () => jest.fn();
