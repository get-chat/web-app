import '@testing-library/jest-dom';
import { resetAuthApiMocks } from './__mocks__/api/authApi';
import { resetStorageHelperMocks } from './__mocks__/Helpers/StorageHelper';

// Global mock reset function
beforeEach(() => {
	resetAuthApiMocks();
	resetStorageHelperMocks();
});

// Mock window.AndroidWebInterface
beforeAll(() => {
	window.AndroidWebInterface = {
		registerUserToken: jest.fn(),
	};
});

afterAll(() => {
	delete window.AndroidWebInterface;
});
