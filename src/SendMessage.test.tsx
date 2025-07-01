import { renderHook, act } from '@testing-library/react';
import useChat from '@src/components/Main/Chat/ChatView/useChat';
import { createMessage } from '@src/api/messagesApi';
import { EVENT_TOPIC_EMOJI_PICKER_VISIBILITY } from '@src/Constants';
import { AxiosError } from 'axios';
import PubSub from 'pubsub-js';

// Mock PubSub
jest.mock('pubsub-js', () => ({
	__esModule: true,
	default: {
		publish: jest.fn(),
		subscribe: jest.fn(),
		unsubscribe: jest.fn(),
		clearAllSubscriptions: jest.fn(),
	},
}));

// Mock other dependencies
jest.mock('@src/api/messagesApi', () => ({
	createMessage: jest.fn(),
}));

jest.mock('unescape', () => ({
	__esModule: true,
	default: jest.fn((text) => text),
}));

global.window.displayCustomError = jest.fn();

// Mock Redux
const mockDispatch = jest.fn();
jest.mock('@src/store/hooks', () => ({
	useAppSelector: jest.fn((selector) => {
		const mockState = {
			currentUser: { value: { id: 1, name: 'Test User' } },
			users: { value: {} },
			templates: { value: {} },
			savedResponses: { value: {} },
			pendingMessages: { value: [] },
			newMessages: { value: {} },
			UI: {
				isReadOnly: false,
				isSendingPendingMessages: false,
				isTemplatesVisible: false,
				isSavedResponsesVisible: false,
				isInteractiveMessagesVisible: false,
				chosenContact: null,
			},
		};
		return selector(mockState);
	}),
	useAppDispatch: () => mockDispatch,
}));

jest.mock('@src/helpers/Helpers', () => ({
	...jest.requireActual('@src/helpers/Helpers'),
	hasInternetConnection: jest.fn(() => true),
	translateHTMLInputToText: jest.fn((text) => text),
}));

describe('useChat hook - sendMessage functionality', () => {
	const mockProps = {
		waId: '1234567890',
		isLoaded: true,
		setExpired: jest.fn(),
		handleIfUnauthorized: jest.fn(),
		MESSAGES_PER_PAGE: 30,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockDispatch.mockClear();
		(createMessage as jest.Mock).mockClear();
		(PubSub.publish as jest.Mock).mockClear();
		require('unescape').default.mockImplementation((text) => text);
		require('@src/helpers/Helpers').hasInternetConnection.mockReturnValue(true);
	});

	it('should send a message successfully', async () => {
		(createMessage as jest.Mock).mockResolvedValue({
			status: 200,
			data: { id: 'msg-123' },
		});

		const { result } = renderHook(() => useChat(mockProps));

		act(() => {
			result.current.setInput('Hello, world!');
		});

		await act(async () => {
			// Mock the setInput function to verify it's called
			const originalSetInput = result.current.setInput;
			result.current.setInput = jest.fn();

			await result.current.sendMessage(false, {
				preventDefault: jest.fn(),
			} as any);

			// Verify setInput was called with empty string
			expect(result.current.setInput).toHaveBeenCalledWith('');

			// Restore original
			result.current.setInput = originalSetInput;
		});

		expect(createMessage).toHaveBeenCalledWith({
			wa_id: '1234567890',
			type: 'text',
			text: {
				body: 'Hello, world!',
			},
		});

		expect(PubSub.publish).toHaveBeenCalledWith(
			EVENT_TOPIC_EMOJI_PICKER_VISIBILITY,
			false
		);
	});

	it('should handle expired chat (status 453)', async () => {
		const error = {
			response: {
				status: 453,
				data: { error: 'Chat expired' },
			},
		};
		(createMessage as jest.Mock).mockRejectedValue(error);

		const { result } = renderHook(() => useChat(mockProps));

		await act(async () => {
			await result.current.sendMessage(false, {
				preventDefault: jest.fn(),
			} as any);
		});

		expect(mockProps.setExpired).toHaveBeenCalledWith(true);
		expect(PubSub.publish).toHaveBeenCalledWith(
			EVENT_TOPIC_EMOJI_PICKER_VISIBILITY,
			false
		);
	});

	it('should handle server errors (status >= 500)', async () => {
		const error = {
			response: {
				status: 500,
				data: { error: 'Server error' },
			},
		};
		(createMessage as jest.Mock).mockRejectedValue(error);

		const { result } = renderHook(() => useChat(mockProps));

		await act(async () => {
			await result.current.sendMessage(false, {
				preventDefault: jest.fn(),
			} as any);
		});

		// Verify the important dispatches happened
		expect(
			mockDispatch.mock.calls.some(
				(call) => call[0].type === 'pendingMessages/set'
			)
		).toBeTruthy();

		expect(PubSub.publish).toHaveBeenCalledWith(
			EVENT_TOPIC_EMOJI_PICKER_VISIBILITY,
			false
		);
	});

	it('should handle unauthorized errors (status 401)', async () => {
		const error = {
			response: {
				status: 401,
				data: { error: 'Unauthorized' },
			},
		} as AxiosError;
		(createMessage as jest.Mock).mockRejectedValue(error);

		const { result } = renderHook(() => useChat(mockProps));

		await act(async () => {
			await result.current.sendMessage(false, {
				preventDefault: jest.fn(),
			} as any);
		});

		expect(mockProps.handleIfUnauthorized).toHaveBeenCalledWith(error);
		expect(PubSub.publish).toHaveBeenCalledWith(
			EVENT_TOPIC_EMOJI_PICKER_VISIBILITY,
			false
		);
	});
});
