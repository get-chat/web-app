import { renderHook, act } from '@testing-library/react';
import useChat from '@src/components/Main/Chat/ChatView/useChat';
import { createMessage } from '@src/api/messagesApi';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_EMOJI_PICKER_VISIBILITY } from '@src/Constants';

jest.mock('pubsub-js', () => ({
	__esModule: true,
	default: {
		publish: jest.fn(),
	},
}));

jest.mock('@src/api/messagesApi', () => ({
	createMessage: jest.fn(),
}));

jest.mock('unescape', () => ({
	__esModule: true,
	default: jest.fn((text) => text),
}));

jest.mock('@src/helpers/Helpers', () => ({
	...jest.requireActual('@src/helpers/Helpers'),
	hasInternetConnection: jest.fn(() => true),
	translateHTMLInputToText: jest.fn((text) => text),
}));

// Mock Redux hooks
const mockDispatch = jest.fn();
jest.mock('@src/store/hooks', () => ({
	useAppSelector: jest.fn(() => ({})),
	useAppDispatch: () => mockDispatch,
}));

jest.mock('@src/helpers/StorageHelper', () => ({
	getMessageDraft: jest.fn(),
	storeMessageDraft: jest.fn(),
	removeMessageDraft: jest.fn(),
}));

// Mock global
global.window.displayCustomError = jest.fn();

describe('useChat - sendMessage', () => {
	it('should send a message successfully', async () => {
		// Arrange
		(createMessage as jest.Mock).mockResolvedValue({
			status: 200,
			data: { id: 'msg-123' },
		});

		const mockProps = {
			waId: '1234567890',
			isLoaded: true,
			setExpired: jest.fn(),
			handleIfUnauthorized: jest.fn(),
			MESSAGES_PER_PAGE: 30,
		};

		const { result } = renderHook(() => useChat(mockProps));

		// Set input value
		act(() => {
			result.current.setInput('Hello world!');
		});

		// Act
		await act(async () => {
			await result.current.sendMessage(false, {
				preventDefault: jest.fn(),
			} as any);
		});

		// Assert
		expect(createMessage).toHaveBeenCalledWith({
			wa_id: '1234567890',
			type: 'text',
			text: { body: 'Hello world!' },
		});

		expect(PubSub.publish).toHaveBeenCalledWith(
			EVENT_TOPIC_EMOJI_PICKER_VISIBILITY,
			false
		);
	});
});
