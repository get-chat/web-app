const mockSubscribe = jest.fn();
const mockUnsubscribe = jest.fn();
const mockPublish = jest.fn();

export default {
	subscribe: mockSubscribe,
	unsubscribe: mockUnsubscribe,
	publish: mockPublish,
};

export { mockSubscribe, mockUnsubscribe, mockPublish };
