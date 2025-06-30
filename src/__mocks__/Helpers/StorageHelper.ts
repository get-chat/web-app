export const storeToken = jest.fn();
export const getToken = jest.fn(() => null);
export const clearToken = jest.fn();
export const getApiBaseURLsMergedWithConfig = jest.fn(() => []);

export const resetStorageHelperMocks = () => {
	storeToken.mockReset();
	getToken.mockReset();
	clearToken.mockReset();
	getApiBaseURLsMergedWithConfig.mockReset();
};
