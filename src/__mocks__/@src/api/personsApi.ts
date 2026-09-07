const nowInSeconds = () => Math.floor(Date.now() / 1000);

export const retrievePerson = jest.fn(() =>
	Promise.resolve({
		wa_id: '1234567890',
		name: 'Test User',
		last_message_timestamp: nowInSeconds() - 60 * 60,
		// The API always sends the effective messaging window; it is never null
		messaging_window_expires_at: nowInSeconds() + 23 * 60 * 60,
		messaging_window_origin: 'service',
	})
);
