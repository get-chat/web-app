import {
	isPersonExpired,
	mergeMessagingWindow,
} from '@src/helpers/PersonHelper';
import { Person } from '@src/types/persons';

/**
 * `isPersonExpired` drives the chat header (greyed-out avatar and the
 * "Expired" indicator) from a person payload rather than a chat one, but it is
 * the same messaging window: `PersonSerializer` is what `ChatSerializer`
 * embeds, so both carry `messaging_window_expires_at`.
 *
 * See the note in ChatHelper.test.ts for the contract.
 */

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

const nowInSeconds = () => Math.floor(Date.now() / 1000);

interface PersonWindow {
	last_message_timestamp: number;
	messaging_window_expires_at?: number;
	messaging_window_origin?: string | null;
}

const buildPerson = (window: PersonWindow): Person =>
	({
		wa_id: '905383192532',
		waba_payload: {
			profile: { name: 'Konrad' },
			wa_id: '905383192532',
		},
		initials: 'K',
		resolved: false,
		...window,
	} as unknown as Person);

describe('isPersonExpired', () => {
	it('keeps the person open while the API window is in the future', () => {
		const person = buildPerson({
			last_message_timestamp: nowInSeconds() - 3 * DAY,
			messaging_window_expires_at: nowInSeconds() + 4 * DAY,
			messaging_window_origin: 'referral_conversion',
		});

		expect(isPersonExpired(person)).toBe(false);
	});

	it('is still open at the exact expiry second, like the backend 453 check', () => {
		const person = buildPerson({
			last_message_timestamp: nowInSeconds() - 3 * DAY,
			messaging_window_expires_at: nowInSeconds(),
		});

		expect(isPersonExpired(person)).toBe(false);
	});

	it('is expired once the window has passed', () => {
		const person = buildPerson({
			last_message_timestamp: nowInSeconds() - 8 * DAY,
			messaging_window_expires_at: nowInSeconds() - 1 * HOUR,
		});

		expect(isPersonExpired(person)).toBe(true);
	});

	it('treats a payload without the window as closed', () => {
		expect(
			isPersonExpired(
				buildPerson({ last_message_timestamp: nowInSeconds() - 2 * HOUR })
			)
		).toBe(true);
	});

	it('treats a missing person as expired', () => {
		expect(isPersonExpired(undefined)).toBe(true);
	});
});

describe('mergeMessagingWindow', () => {
	const contactWithWindow = {
		wa_id: '905383192532',
		messaging_window_expires_at: nowInSeconds() + 4 * DAY,
		messaging_window_origin: 'referral_conversion',
	} as unknown as Person;

	it('reopens a stale contact from the window a message brought with it', () => {
		// What the WebSocket delivers: an incoming message whose embedded
		// contact carries the window the backend has just recomputed.
		const stale = buildPerson({
			last_message_timestamp: nowInSeconds() - 3 * DAY,
			messaging_window_expires_at: nowInSeconds() - 2 * DAY,
		});
		expect(isPersonExpired(stale)).toBe(true);

		const merged = mergeMessagingWindow(stale, contactWithWindow);

		expect(merged.messaging_window_expires_at).toBe(
			contactWithWindow.messaging_window_expires_at
		);
		expect(merged.messaging_window_origin).toBe('referral_conversion');
		expect(isPersonExpired(merged)).toBe(false);
	});

	it('keeps every other field of the target', () => {
		const person = buildPerson({
			last_message_timestamp: nowInSeconds() - 3 * DAY,
		});

		const merged = mergeMessagingWindow(person, contactWithWindow);

		expect(merged.wa_id).toBe(person.wa_id);
		expect(merged.initials).toBe(person.initials);
		expect(merged.last_message_timestamp).toBe(person.last_message_timestamp);
	});

	it('leaves the target untouched when the payload carries no window', () => {
		const person = buildPerson({
			last_message_timestamp: nowInSeconds() - 3 * DAY,
			messaging_window_expires_at: nowInSeconds() + 1 * HOUR,
		});

		// An envelope-derived message has no contact at all, and an older
		// Inbox sends one without the window fields
		expect(mergeMessagingWindow(person, undefined)).toBe(person);
		expect(
			mergeMessagingWindow(person, { wa_id: '905383192532' } as Person)
		).toBe(person);
	});

	it('clears a stale origin when the new window has none', () => {
		const person = buildPerson({
			last_message_timestamp: nowInSeconds() - 3 * DAY,
			messaging_window_expires_at: nowInSeconds() - 2 * DAY,
			messaging_window_origin: 'referral_conversion',
		});

		const merged = mergeMessagingWindow(person, {
			messaging_window_expires_at: nowInSeconds() + 1 * HOUR,
		} as Person);

		expect(merged.messaging_window_origin).toBeNull();
	});
});
