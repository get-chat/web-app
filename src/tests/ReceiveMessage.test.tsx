import React from 'react';
import { act, render } from '@testing-library/react';
import { TestProviders } from '@src/__mocks__/test-utils';
import ChatView from '@src/components/Main/Chat/ChatView/ChatView';
import { EVENT_TOPIC_NEW_CHAT_MESSAGES } from '@src/Constants';
import { Message, MessageType } from '@src/types/messages';
import ChatMessageList from '@src/interfaces/ChatMessageList';

jest.mock('pubsub-js');
const { mockSubscribe } = require('pubsub-js');

// Mock VoiceRecord component
jest.mock('@src/components/VoiceRecord/VoiceRecord');

// Mock html-to-formatted-text
jest.mock('html-to-formatted-text');

// Mock API
jest.mock('@src/api/chatsApi');
jest.mock('@src/api/messagesApi');
jest.mock('@src/api/personsApi');
jest.mock('@src/api/chatTaggingApi');
jest.mock('@src/api/chatAssignmentApi');

// Mock Redux
jest.mock('@src/store/hooks');

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

		// Setup default mock for subscribe
		mockSubscribe.mockImplementation((topic: any, handler: any) => {
			if (topic === EVENT_TOPIC_NEW_CHAT_MESSAGES) {
				return 'mock-token';
			}
			return 'mock-token';
		});
	});

	it('should handle new incoming messages correctly', async () => {
		// Prepare
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
