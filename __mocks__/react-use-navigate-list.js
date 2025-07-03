jest.mock('react-use-navigate-list', () => ({
	__esModule: true,
	default: () => ({
		selectedIndex: 0,
		navigateNext: jest.fn(),
		navigatePrev: jest.fn(),
		resetNavigation: jest.fn(),
	}),
}));
