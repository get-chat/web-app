export const STORAGE_TAG_TOKEN = 'token';
export const getStorage = jest.fn(() => ({
	getItem: jest.fn(() => null),
	setItem: jest.fn(),
	removeItem: jest.fn(),
}));
export const storeToken = jest.fn();
export const getToken = jest.fn(() => null);
export const clearToken = jest.fn();
export const getCurrentApiBaseURL = jest.fn(() => 'http://localhost/api/v1/');
export const getApiBaseURLsMergedWithConfig = jest.fn(() => []);
export const getCurrentTenantId = jest.fn(() => undefined);
export const storeCurrentTenantId = jest.fn();
export const getTenantToken = jest.fn(() => undefined);
export const storeTenantToken = jest.fn();
export const removeTenantToken = jest.fn();
export const clearTenantSession = jest.fn();
export const getLastTenantId = jest.fn(() => undefined);
export const storeLastTenantId = jest.fn();

export const resetStorageHelperMocks = () => {
	storeToken.mockReset();
	getToken.mockReset();
	clearToken.mockReset();
	getCurrentApiBaseURL.mockReset();
	getApiBaseURLsMergedWithConfig.mockReset();
};
