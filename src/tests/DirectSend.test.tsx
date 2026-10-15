import React from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProviders } from '@src/__mocks__/test-utils';
import useChat from '@src/components/Main/Chat/ChatView/useChat';
import ChatMessage from '@src/components/Main/Chat/ChatMessage/ChatMessage';
import ChatFooter from '@src/components/ChatFooter/ChatFooter';
import InteractiveMessageList from '@src/components/InteractiveMessageList/InteractiveMessageList';
import { createMessage } from '@src/api/messagesApi';
import {
	DIRECT_SEND_INTERACTIVE_TYPES,
	isDirectSendMessage,
} from '@src/helpers/MessageHelper';
import { useIsUserActionsRestricted } from '@src/hooks/useIsUserActionsRestricted';
import { Message, MessageType } from '@src/types/messages';

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
}));

jest.mock('@src/helpers/StorageHelper', () => ({
	...jest.requireActual('@src/helpers/StorageHelper'),
	getMessageDraft: jest.fn(),
	storeMessageDraft: jest.fn(),
	removeMessageDraft: jest.fn(),
}));

const mockDispatch = jest.fn();
jest.mock('@src/store/hooks', () => ({
	useAppSelector: jest.fn((selector: (state: any) => any) =>
		selector({
			currentUser: { value: undefined },
			users: { value: {} },
			templates: { value: {} },
			savedResponses: { value: {} },
			pendingMessages: { value: [] },
			UI: {},
			phoneNumber: { value: '' },
			waId: { value: '' },
		})
	),
	useAppDispatch: () => mockDispatch,
}));

jest.mock('@src/hooks/useIsUserActionsRestricted', () => ({
	useIsUserActionsRestricted: jest.fn(() => false),
}));

// Heavy or CommonJS-only pieces of the composer, irrelevant here
jest.mock('emoji-mart', () => ({ Emoji: () => '', NimblePicker: () => null }));
jest.mock('@src/components/VoiceRecord', () => () => null);
jest.mock('@src/components/ContactsModal', () => () => null);
jest.mock('@src/components/LocationModal', () => () => null);
jest.mock('@src/components/QuickActionsMenu', () => () => null);
jest.mock('@src/components/PrintMessage', () => ({
	__esModule: true,
	default: ({ message }: { message: string }) => <span>{message}</span>,
}));

global.window.displayCustomError = jest.fn();

const WA_ID = '905383192532';

const useChatProps = (isDirectSendMode: boolean) => ({
	waId: WA_ID,
	isLoaded: true,
	setExpired: jest.fn(),
	handleIfUnauthorized: jest.fn(),
	MESSAGES_PER_PAGE: 30,
	isDirectSendMode,
});

const sendTypedMessage = async (isDirectSendMode: boolean, text: string) => {
	const { result } = renderHook(() => useChat(useChatProps(isDirectSendMode)));
	act(() => result.current.setInput(text));
	await act(async () => {
		await result.current.sendMessage(false, {
			preventDefault: jest.fn(),
		} as any);
	});
};

describe('useChat - utility messages', () => {
	beforeEach(() => jest.clearAllMocks());

	it('sends a utility message without a link preview', async () => {
		(createMessage as jest.Mock).mockResolvedValue({
			status: 202,
			data: { id: 'msg-1' },
		});

		await sendTypedMessage(true, 'Track it at https://example.com/12345');

		expect(createMessage).toHaveBeenCalledWith({
			wa_id: WA_ID,
			type: 'text',
			text: { body: 'Track it at https://example.com/12345' },
			category: 'utility',
		});
	});

	it('keeps regular messages unchanged', async () => {
		(createMessage as jest.Mock).mockResolvedValue({
			status: 202,
			data: { id: 'msg-2' },
		});

		await sendTypedMessage(false, 'Track it at https://example.com/12345');

		expect(createMessage).toHaveBeenCalledWith({
			wa_id: WA_ID,
			type: 'text',
			text: {
				body: 'Track it at https://example.com/12345',
				preview_url: true,
			},
		});
	});

	it('says so when the inbox does not support utility messages', async () => {
		(createMessage as jest.Mock).mockRejectedValue({
			response: {
				status: 453,
				data: '{"reason": "Customer care messaging window expired."}',
			},
		});

		await sendTypedMessage(true, 'Your order has shipped.');

		expect(window.displayCustomError).toHaveBeenCalledWith(
			'Utility messages are not available on this inbox yet.'
		);
	});

	it('explains a refused utility message', async () => {
		(createMessage as jest.Mock).mockRejectedValue({
			response: {
				status: 400,
				data: { text: ['Direct Send does not support link previews.'] },
			},
		});

		await sendTypedMessage(true, 'Your order has shipped.');

		expect(window.displayCustomError).toHaveBeenCalledWith(
			'The utility message was not sent: %s'
		);
	});

	it('does not toast for refused regular messages', async () => {
		(createMessage as jest.Mock).mockRejectedValue({
			response: { status: 453, data: {} },
		});

		await sendTypedMessage(false, 'Hello');

		expect(window.displayCustomError).not.toHaveBeenCalled();
	});
});

const buildMessage = (waba_payload: object): Message =>
	({
		id: 'a1b2c3d4-0000-0000-0000-000000000000',
		waba_payload: {
			id: 'wamid.DIRECT',
			timestamp: '1783523820',
			...waba_payload,
		},
		waba_statuses: {},
		from_us: true,
		received: false,
		customer_wa_id: WA_ID,
		tags: [],
		chat_tags: [],
		is_failed: false,
	} as unknown as Message);

describe('Utility message bubble', () => {
	it('labels a utility text message', () => {
		const data = buildMessage({
			type: MessageType.text,
			text: { body: 'Your order has shipped.' },
			category: 'utility',
		});

		render(
			<TestProviders>
				<ChatMessage data={data} />
			</TestProviders>
		);

		expect(isDirectSendMessage(data)).toBe(true);
		expect(screen.getByText('Utility message')).toBeInTheDocument();
	});

	it('labels a utility interactive message instead of "Interactive message"', () => {
		render(
			<TestProviders>
				<ChatMessage
					data={buildMessage({
						type: MessageType.interactive,
						interactive: {
							type: 'button',
							body: { text: 'Your appointment is tomorrow.' },
							action: {
								buttons: [
									{ type: 'reply', reply: { id: 'b1', title: 'Confirm' } },
								],
							},
						},
						category: 'utility',
					})}
				/>
			</TestProviders>
		);

		expect(screen.getByText('Utility message')).toBeInTheDocument();
		expect(screen.queryByText('Interactive message')).not.toBeInTheDocument();
	});

	it('leaves regular messages unlabelled', () => {
		const data = buildMessage({
			type: MessageType.text,
			text: { body: 'Hello' },
		});

		render(
			<TestProviders>
				<ChatMessage data={data} />
			</TestProviders>
		);

		expect(isDirectSendMessage(data)).toBe(false);
		expect(screen.queryByText('Utility message')).not.toBeInTheDocument();
	});
});

const renderFooter = (
	props: Partial<React.ComponentProps<typeof ChatFooter>>
) =>
	render(
		<TestProviders>
			<ChatFooter
				waId={WA_ID}
				isExpired={true}
				input=""
				setInput={jest.fn()}
				sendMessage={jest.fn()}
				setSelectedFiles={jest.fn()}
				accept=""
				setAccept={jest.fn()}
				sendHandledChosenFiles={jest.fn()}
				processCommand={jest.fn()}
				onStartDirectSend={jest.fn()}
				onStopDirectSend={jest.fn()}
				{...props}
			/>
		</TestProviders>
	);

describe('ChatFooter - utility messages', () => {
	beforeEach(() =>
		(useIsUserActionsRestricted as jest.Mock).mockReturnValue(false)
	);

	it('offers a utility message while the window is closed', async () => {
		const onStartDirectSend = jest.fn();
		renderFooter({ onStartDirectSend });

		expect(
			screen.getByText(
				'Window closed. Reply with a template or a utility message.'
			)
		).toBeInTheDocument();
		await userEvent.click(screen.getByText('Utility message'));
		expect(onStartDirectSend).toHaveBeenCalled();
	});

	it('does not offer it while the window is open', () => {
		renderFooter({ isExpired: false });

		expect(screen.queryByText('Utility message')).not.toBeInTheDocument();
	});

	it('does not offer it to users who cannot send templates', () => {
		(useIsUserActionsRestricted as jest.Mock).mockReturnValue(true);
		renderFooter({});

		expect(screen.queryByText('Utility message')).not.toBeInTheDocument();
		expect(
			screen.getByText(
				'This chat has expired. You need to answer with template messages.'
			)
		).toBeInTheDocument();
	});

	it('keeps a draft in a closed window from being sent as a regular message', () => {
		const sendMessage = jest.fn();
		const { container } = renderFooter({ input: 'Your order', sendMessage });

		expect(
			container.querySelector('[data-test-id="send-message-button"]')
		).toBeNull();
	});

	it('unlocks the composer for a utility message and can leave it', async () => {
		const onStopDirectSend = jest.fn();
		const { container } = renderFooter({
			isDirectSendMode: true,
			onStopDirectSend,
		});

		expect(
			container.querySelector('[data-test-id="direct-send-strip"]')
		).not.toBeNull();
		expect(
			screen.getByText('Type an update, like an order or booking change')
		).toBeInTheDocument();
		// Nothing a utility message cannot carry
		expect(screen.queryByText('Attachment')).not.toBeInTheDocument();

		await userEvent.click(screen.getByLabelText('Back to regular messages'));
		expect(onStopDirectSend).toHaveBeenCalled();
	});
});

describe('InteractiveMessageList - utility messages', () => {
	it('offers only the interactive messages Direct Send supports', () => {
		render(
			<TestProviders>
				<InteractiveMessageList
					onSelect={jest.fn()}
					allowedTypes={DIRECT_SEND_INTERACTIVE_TYPES}
				/>
			</TestProviders>
		);

		expect(
			screen.getByText('Send call-to-action URL button message')
		).toBeInTheDocument();
		expect(screen.getByText('Send reply buttons message')).toBeInTheDocument();
		expect(screen.queryByText('Send list message')).not.toBeInTheDocument();
		expect(
			screen.queryByText('Send location request message')
		).not.toBeInTheDocument();
	});
});
