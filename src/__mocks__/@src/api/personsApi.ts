export const retrievePerson = jest.fn(() =>
	Promise.resolve({
		wa_id: '1234567890',
		name: 'Test User',
		last_message_timestamp: Date.now(),
	})
);
