import { act, renderHook } from '@testing-library/react';
import useChatListItem from '@src/components/ChatListItem/useChatListItem';
import { Chat } from '@src/types/chats';

/**
 * The chat list shows a countdown ("This chat will expire in %s") and an
 * `almostExpired` highlight below 8 hours left. Both come from
 * `remainingSeconds`, which has to count down to the window the API reports
 * (`contact.messaging_window_expires_at`) rather than to a fixed 24h after the
 * customer's last message — otherwise a 7-day click-to-WhatsApp chat is shown
 * as expired while the backend still accepts free-form messages.
 *
 * The countdown string itself is not asserted: `react-i18next` is mocked
 * globally in jest.setup.ts with a `t` that returns the key and drops the
 * interpolated value.
 */

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

const nowInSeconds = () => Math.floor(Date.now() / 1000);

jest.mock('pubsub-js');

jest.mock('react-router-dom', () => ({
	useParams: () => ({ waId: '905383192532' }),
	useNavigate: () => jest.fn(),
}));

jest.mock('@src/store/hooks', () => ({
	useAppSelector: jest.fn((selector: any) =>
		selector({
			UI: { isSelectionModeEnabled: false, selectedChats: [] },
			pendingMessages: { value: [] },
		})
	),
	useAppDispatch: () => jest.fn(),
}));

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

const renderChatListItem = async (contact: ContactWindow) => {
	const rendered = renderHook(() =>
		useChatListItem({
			props: {
				chatData: buildChat(contact),
				setSelectedChats: jest.fn(),
			},
		})
	);

	// Flush the async remaining-time calculation in the hook's effect
	await act(async () => {});

	return rendered;
};

describe('useChatListItem - messaging window countdown', () => {
	it('counts down to the window the API reports, not 24h after the last message', async () => {
		const { result, unmount } = await renderChatListItem({
			last_message_timestamp: nowInSeconds() - 3 * DAY,
			messaging_window_expires_at: nowInSeconds() + 4 * DAY,
			messaging_window_origin: 'referral_conversion',
		});

		expect(result.current.isExpired).toBe(false);
		expect(Math.abs(result.current.remainingSeconds - 4 * DAY)).toBeLessThan(
			60
		);

		unmount();
	});

	it('does not flag a chat as almost expired while days remain', async () => {
		// `almostExpired` is styled at remainingSeconds < 8h in ChatListItem
		const { result, unmount } = await renderChatListItem({
			last_message_timestamp: nowInSeconds() - 2 * DAY,
			messaging_window_expires_at: nowInSeconds() + 5 * DAY,
			messaging_window_origin: 'referral_conversion',
		});

		expect(result.current.remainingSeconds).toBeGreaterThan(8 * HOUR);

		unmount();
	});

	it('marks the chat expired once the window has closed', async () => {
		const { result, unmount } = await renderChatListItem({
			last_message_timestamp: nowInSeconds() - 8 * DAY,
			messaging_window_expires_at: nowInSeconds() - 1 * HOUR,
		});

		expect(result.current.isExpired).toBe(true);
		expect(result.current.remainingSeconds).toBeLessThanOrEqual(0);

		unmount();
	});
});
