import { isChatExpired } from '@src/helpers/ChatHelper';
import { Chat } from '@src/types/chats';

/**
 * The customer care messaging window is no longer a fixed 24 hours.
 *
 * The Integration API exposes the *effective* window as
 * `contact.messaging_window_expires_at` (a POSIX timestamp in seconds), which
 * is the same value the send path enforces: a non-template message is rejected
 * with HTTP 453 exactly when `messaging_window_expires_at < now`. It is derived
 * from what Meta reported for the conversation, the customer's last message as
 * a floor, and — for click-to-WhatsApp chats we have not replied to yet — the
 * ad referral, which keeps the window open for up to 7 days.
 *
 * So this app must read the field instead of re-deriving a duration. See the
 * `inbox` repo, `main/tests/viewsets/contacts/test_messaging_window_fields.py`.
 */

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

const nowInSeconds = () => Math.floor(Date.now() / 1000);

interface ContactWindow {
	last_message_timestamp: number;
	messaging_window_expires_at?: number;
	messaging_window_origin?: string | null;
}

const buildChat = (contact: ContactWindow): Chat =>
	({
		wa_id: '905383192532',
		new_messages: 0,
		tags: [],
		contact: {
			wa_id: '905383192532',
			waba_payload: {
				profile: { name: 'Konrad' },
				wa_id: '905383192532',
			},
			initials: 'K',
			resolved: false,
			...contact,
		},
	} as unknown as Chat);

describe('isChatExpired', () => {
	it('keeps a click-to-WhatsApp chat open while the API window is in the future', () => {
		// An ad lead nobody has replied to yet: the customer wrote 3 days ago,
		// but the referral keeps the window open for 7 days.
		const chat = buildChat({
			last_message_timestamp: nowInSeconds() - 3 * DAY,
			messaging_window_expires_at: nowInSeconds() + 4 * DAY,
			messaging_window_origin: 'referral_conversion',
		});

		expect(isChatExpired(chat)).toBe(false);
	});

	it('keeps the chat open when Meta extended the window past 24h', () => {
		// Not a CTWA chat — Meta simply reported a later expiration for this
		// conversation than our own 24h floor would give.
		const chat = buildChat({
			last_message_timestamp: nowInSeconds() - 30 * HOUR,
			messaging_window_expires_at: nowInSeconds() + 12 * HOUR,
			messaging_window_origin: 'service',
		});

		expect(isChatExpired(chat)).toBe(false);
	});

	it('is still open at the exact expiry second, like the backend 453 check', () => {
		// The backend rejects when `expires_at < now`, so the boundary second
		// itself is still sendable.
		const chat = buildChat({
			last_message_timestamp: nowInSeconds() - 3 * DAY,
			messaging_window_expires_at: nowInSeconds(),
		});

		expect(isChatExpired(chat)).toBe(false);
	});

	it('is expired once the window has passed', () => {
		const chat = buildChat({
			last_message_timestamp: nowInSeconds() - 8 * DAY,
			messaging_window_expires_at: nowInSeconds() - 1 * DAY,
			messaging_window_origin: 'referral_conversion',
		});

		expect(isChatExpired(chat)).toBe(true);
	});

	it('treats a payload without the window as closed', () => {
		// Every Inbox sends the effective window, so there is no duration to
		// guess here. Failing closed matches what the backend would answer for
		// such a contact anyway: 453.
		const chat = buildChat({
			last_message_timestamp: nowInSeconds() - 2 * HOUR,
		});

		expect(isChatExpired(chat)).toBe(true);
	});

	it('treats a missing chat as expired', () => {
		expect(isChatExpired(undefined)).toBe(true);
	});
});
