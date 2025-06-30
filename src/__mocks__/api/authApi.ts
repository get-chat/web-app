export const login = jest.fn();
export const logout = jest.fn();

// Reset all mocks before each test
export const resetAuthApiMocks = () => {
	login.mockReset();
	logout.mockReset();
};
