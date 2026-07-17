import {
	containsPreviewableURL,
	getEchoOriginLabel,
	getSenderName,
	getUniqueSender,
	isUnsupportedMessageType,
	prepareMessageList,
} from '@src/helpers/MessageHelper';
import { Message, MessageEchoOrigin, MessageType } from '@src/types/messages';

const buildOutgoingMessage = (overrides: Partial<Message> = {}): Message =>
	({
		id: 'f9a6b7c8-0000-0000-0000-000000000000',
		waba_payload: {
			id: 'wamid.TEST',
			from: '4915792500517',
			type: 'text',
			timestamp: '1783523820',
			text: { body: 'Hello' },
		},
		from_us: true,
		received: false,
		customer_wa_id: '905383192532',
		tags: [],
		chat_tags: [],
		is_failed: false,
		...overrides,
	} as Message);

describe('getEchoOriginLabel', () => {
	it('labels API echoes', () => {
		expect(
			getEchoOriginLabel(
				buildOutgoingMessage({ echo_origin: MessageEchoOrigin.api })
			)
		).toBe('via API');
	});

	it('labels WhatsApp Business app echoes', () => {
		expect(
			getEchoOriginLabel(
				buildOutgoingMessage({ echo_origin: MessageEchoOrigin.smb })
			)
		).toBe('via WhatsApp Business App');
	});

	it('returns undefined for regular outgoing messages', () => {
		expect(getEchoOriginLabel(buildOutgoingMessage())).toBeUndefined();
	});

	it('labels REST-fetched API echoes via the stored is_echo marker', () => {
		// After a page refresh echoes arrive via REST, which carries no
		// echo_origin — only waba_payload.is_echo
		const message = buildOutgoingMessage();
		message.waba_payload!.is_echo = true;
		expect(getEchoOriginLabel(message)).toBe('via API');
	});
});

describe('getSenderName - echoed messages', () => {
	it('keeps returning Us for echoes so name-based surfaces (media preview, initials) stay intact', () => {
		expect(
			getSenderName(
				buildOutgoingMessage({ echo_origin: MessageEchoOrigin.api })
			)
		).toBe('Us');
		expect(getSenderName(buildOutgoingMessage())).toBe('Us');
	});
});

describe('getUniqueSender - echoed messages', () => {
	it('groups echoes under an origin key that cannot collide with a username', () => {
		expect(
			getUniqueSender(
				buildOutgoingMessage({ echo_origin: MessageEchoOrigin.api })
			)
		).toBe('echo:api');
		expect(
			getUniqueSender(
				buildOutgoingMessage({ echo_origin: MessageEchoOrigin.smb })
			)
		).toBe('echo:smb');
		expect(getUniqueSender(buildOutgoingMessage())).toBe('4915792500517');
	});

	it('groups REST-fetched API echoes with webhook-delivered ones', () => {
		const message = buildOutgoingMessage();
		message.waba_payload!.is_echo = true;
		expect(getUniqueSender(message)).toBe('echo:api');
	});
});

describe('prepareMessageList - failed messages', () => {
	// REST responses have no is_failed field (it is set client-side by the
	// websocket status handler), only the errors stored in waba_payload
	const buildRestError = () => [
		{ code: 131047, title: 'Re-engagement message' },
	];

	it('derives is_failed from stored payload errors on outgoing messages', () => {
		const message = buildOutgoingMessage();
		message.waba_payload!.errors = buildRestError();
		delete (message as Partial<Message>).is_failed;

		const prepared = prepareMessageList([message]);
		expect(prepared['wamid.TEST'].is_failed).toBe(true);
	});

	it('does not flag outgoing messages without errors', () => {
		const message = buildOutgoingMessage();
		delete (message as Partial<Message>).is_failed;

		const prepared = prepareMessageList([message]);
		expect(prepared['wamid.TEST'].is_failed).toBeFalsy();
	});

	it('does not flag incoming messages with errors (e.g. unsupported types)', () => {
		const message = buildOutgoingMessage({ from_us: false });
		message.waba_payload!.errors = buildRestError();
		delete (message as Partial<Message>).is_failed;

		const prepared = prepareMessageList([message]);
		expect(prepared['wamid.TEST'].is_failed).toBeFalsy();
	});
});

describe('containsPreviewableURL', () => {
	it('detects http and https URLs', () => {
		expect(containsPreviewableURL('Check https://get.chat for info')).toBe(
			true
		);
		expect(containsPreviewableURL('http://example.com')).toBe(true);
		expect(containsPreviewableURL('HTTPS://EXAMPLE.COM')).toBe(true);
	});

	it('rejects text without a previewable URL', () => {
		expect(containsPreviewableURL('Hello world')).toBe(false);
		// WhatsApp does not render previews for scheme-less URLs
		expect(containsPreviewableURL('visit example.com today')).toBe(false);
		expect(containsPreviewableURL('ftp://example.com')).toBe(false);
		expect(containsPreviewableURL('')).toBe(false);
	});
});

describe('isUnsupportedMessageType', () => {
	it('accepts every known message type', () => {
		Object.values(MessageType).forEach((type) => {
			expect(isUnsupportedMessageType(type)).toBe(false);
		});
	});

	it('flags unknown types but not missing ones', () => {
		expect(isUnsupportedMessageType('some_future_type')).toBe(true);
		expect(isUnsupportedMessageType(undefined)).toBe(false);
	});
});
