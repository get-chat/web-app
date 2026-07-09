import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestProviders } from '@src/__mocks__/test-utils';
import ChatMessage from '@src/components/Main/Chat/ChatMessage/ChatMessage';
import { Message, MessageEchoOrigin, MessageType } from '@src/types/messages';

// Mock Redux
jest.mock('@src/store/hooks');

// PrintMessage pulls in CommonJS modules (emoji-tree, linkify) that do not
// resolve under ts-jest interop; the raw text is enough for these tests
jest.mock('@src/components/PrintMessage', () => ({
	__esModule: true,
	default: ({ message }: { message: string }) => <span>{message}</span>,
}));

const buildEchoMessage = (overrides: Partial<Message> = {}): Message =>
	({
		id: 'f9a6b7c8-0000-0000-0000-000000000000',
		waba_payload: {
			id: 'wamid.ECHO',
			from: '4915792500517',
			to: '905383192532',
			type: MessageType.text,
			timestamp: '1783523820',
			text: { body: 'sent via the API, not the inbox' },
		},
		waba_statuses: {},
		from_us: true,
		received: false,
		customer_wa_id: '905383192532',
		tags: [],
		chat_tags: [],
		is_failed: false,
		echo_origin: MessageEchoOrigin.api,
		...overrides,
	} as Message);

describe('ChatMessage - echoed messages', () => {
	it('renders API echoes as outgoing with a via API sender label', () => {
		const data = buildEchoMessage();

		const { container } = render(
			<TestProviders>
				<ChatMessage data={data} displaySender={true} />
			</TestProviders>
		);

		expect(screen.getByText('via API')).toBeInTheDocument();
		expect(
			screen.getByText('sent via the API, not the inbox')
		).toBeInTheDocument();
		// Outgoing messages get the message_<id> container with $isOutgoing styling
		expect(container.querySelector('#message_' + data.id)).not.toBeNull();
	});

	it('renders WhatsApp Business app echoes with a dedicated sender label', () => {
		render(
			<TestProviders>
				<ChatMessage
					data={buildEchoMessage({ echo_origin: MessageEchoOrigin.smb })}
					displaySender={true}
				/>
			</TestProviders>
		);

		expect(screen.getByText('via WhatsApp Business App')).toBeInTheDocument();
	});

	it('renders a graceful fallback for unknown message types', () => {
		render(
			<TestProviders>
				<ChatMessage
					data={buildEchoMessage({
						waba_payload: {
							id: 'wamid.UNKNOWN',
							from: '4915792500517',
							type: 'some_future_type' as MessageType,
							timestamp: '1783523820',
						},
					})}
					displaySender={true}
				/>
			</TestProviders>
		);

		expect(screen.getByText('Unsupported message')).toBeInTheDocument();
	});
});
