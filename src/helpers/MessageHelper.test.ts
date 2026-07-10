import {
	containsPreviewableURL,
	getEchoOriginLabel,
	getSenderName,
	getUniqueSender,
	isUnsupportedMessageType,
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
