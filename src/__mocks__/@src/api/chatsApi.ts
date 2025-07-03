export const fetchChat = jest.fn(() =>
	Promise.resolve({
		id: 'chat-123',
		wa_id: '1234567890',
		status: 'active',
	})
);
