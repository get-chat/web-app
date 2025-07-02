import '@testing-library/jest-dom';
import { resetAuthApiMocks } from '@src/__mocks__/@src/api/authApi';
import { resetStorageHelperMocks } from '@src/__mocks__/@src/helpers/StorageHelper';

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
