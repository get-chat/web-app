import React from 'react';
import { act, render } from '@testing-library/react';
import { TestProviders } from '@src/__mocks__/test-utils';
import ChatView from '@src/components/Main/Chat/ChatView/ChatView';
import { EVENT_TOPIC_NEW_CHAT_MESSAGES } from '@src/Constants';
import { Message, MessageType } from '@src/types/messages';
import ChatMessageList from '@src/interfaces/ChatMessageList';

jest.mock('pubsub-js', () => {
	const mockSubscribe = jest.fn();
	const mockUnsubscribe = jest.fn();
	const mockPublish = jest.fn();

	return {
		__esModule: true,
		default: {
			subscribe: mockSubscribe,
			unsubscribe: mockUnsubscribe,
			publish: mockPublish,
		},
		// Export the mocks for use in tests
		mockSubscribe,
		mockUnsubscribe,
		mockPublish,
	};
});

// Then get the mocked version
const PubSub = require('pubsub-js');
const { mockSubscribe, mockUnsubscribe, mockPublish } = PubSub;

// Mock VoiceRecord component
jest.mock('@src/components/VoiceRecord/VoiceRecord', () => ({
	__esModule: true,
	default: () => <div>VoiceRecord Mock</div>,
	cancelVoiceRecord: jest.fn(),
}));

// Mock html-to-formatted-text
jest.mock('html-to-formatted-text', () => ({
	__esModule: true,
	default: jest.fn((text) => text),
}));

// Mock other dependencies
jest.mock('@src/api/chatsApi', () => ({
	fetchChat: jest.fn(() =>
		Promise.resolve({
			id: 'chat-123',
			wa_id: '1234567890',
			status: 'active',
		})
	),
}));

jest.mock('@src/api/messagesApi', () => ({
	fetchMessages: jest.fn(() => Promise.resolve({ results: [] })),
	markAsReceived: jest.fn(() => Promise.resolve()),
	createMessage: jest.fn(),
}));

jest.mock('@src/api/personsApi', () => ({
	retrievePerson: jest.fn(() =>
		Promise.resolve({
			wa_id: '1234567890',
			name: 'Test User',
			last_message_timestamp: Date.now(),
		})
	),
}));

jest.mock('@src/api/chatTaggingApi', () => ({
	fetchChatTaggingEvents: jest.fn(() => Promise.resolve({ results: [] })),
}));

jest.mock('@src/api/chatAssignmentApi', () => ({
	fetchChatAssignmentEvents: jest.fn(() => Promise.resolve({ results: [] })),
}));

// Mock Redux
const mockDispatch = jest.fn();
jest.mock('@src/store/hooks', () => ({
	useAppSelector: jest.fn((selector) =>
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
	),
	useAppDispatch: () => mockDispatch,
}));

describe('ChatView - Message Receiving', () => {
	const mockProps = {
		createSavedResponse: jest.fn(),
		contactProvidersData: {},
		retrieveContactData: jest.fn(),
		displayNotification: jest.fn(),
		isChatOnly: false,
		setChatTagsVisible: jest.fn(),
		searchMessagesByKeyword: jest.fn(),
		setMessageWithStatuses: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();

		// Setup default mock implementation for subscribe
		mockSubscribe.mockImplementation((topic: any, handler: any) => {
			if (topic === EVENT_TOPIC_NEW_CHAT_MESSAGES) {
				return 'mock-token';
			}
			return 'mock-token';
		});
	});

	it('should handle new incoming messages correctly', async () => {
		// Arrange
		const testMessage: Message = {
			id: 'msg-123',
			waba_payload: {
				id: 'waba-123',
				type: MessageType.text,
				text: { body: 'Hello from test' },
				wa_id: '1234567890',
				timestamp: '0',
			},
			from_us: false,
			received: false,
			customer_wa_id: '1234567890',
			tags: [],
			chat_tags: [],
			is_failed: false,
		};

		const testMessages: ChatMessageList = {
			'waba-123': testMessage,
		};

		// Mock useParams to return a waId
		jest.mock('react-router-dom', () => ({
			...jest.requireActual('react-router-dom'),
			useParams: () => ({ waId: '1234567890' }),
		}));

		// Act
		const { container } = await act(async () => {
			return render(
				<TestProviders>
					<ChatView {...mockProps} />
				</TestProviders>
			);
		});

		await act(async () => {
			const handler = mockSubscribe.mock.calls.find(
				(call: any) => call[0] === EVENT_TOPIC_NEW_CHAT_MESSAGES
			)?.[1];
			if (handler) {
				handler(EVENT_TOPIC_NEW_CHAT_MESSAGES, testMessages);
			}
		});

		// Assert
		expect(mockSubscribe).toHaveBeenCalledWith(
			EVENT_TOPIC_NEW_CHAT_MESSAGES,
			expect.any(Function)
		);
	});
});
