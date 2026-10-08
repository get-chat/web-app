// The real storage, not the shared manual mock
jest.unmock('@src/helpers/StorageHelper');
jest.mock('@src/api/authApi');
jest.mock('@src/api/tenantsApi');
jest.mock('@src/api/usersApi');

import {
	clearTenantTokens,
	getCurrentTenantId,
	getTenantToken,
	initStorageType,
	storeCurrentTenantId,
	storeTenantToken,
	storeToken,
} from '@src/helpers/StorageHelper';
import { clearUserSession } from '@src/helpers/ApiHelper';
import {
	acceptInviteKeepingToken,
	getTokenWithoutPassword,
} from '@src/helpers/InboxHelper';

const SUPPORT_ID = 'aaaa1111';
const SALES_ID = 'bbbb2222';

const authApi = require('@src/api/authApi');
const tenantsApi = require('@src/api/tenantsApi');
const usersApi = require('@src/api/usersApi');

// The backend's answer to GET /users/current/ per token
const backend = (answers: { [token: string]: string | number }) =>
	usersApi.fetchCurrentUser.mockImplementation(
		async (config: { headers: { Authorization: string } }) => {
			const answer = answers[config.headers.Authorization.slice(6)];
			if (typeof answer === 'string') return { username: answer };
			throw answer === undefined
				? new Error('Network Error')
				: { response: { status: answer } };
		}
	);

beforeEach(() => {
	jest.clearAllMocks();
	window.localStorage.clear();
	initStorageType();
	authApi.fetchSessionToken.mockRejectedValue({ response: { status: 403 } });
});

describe('Saved inbox tokens', () => {
	beforeEach(() => {
		storeTenantToken('agent', SUPPORT_ID, 'support-token');
		storeTenantToken('agent', SALES_ID, 'sales-token');
		storeCurrentTenantId(SUPPORT_ID);
		storeToken('support-token');
	});

	it('stay on logout', () => {
		clearUserSession(undefined, undefined, undefined);

		expect(getTenantToken('agent', SUPPORT_ID)).toBe('support-token');
		expect(getTenantToken('agent', SALES_ID)).toBe('sales-token');
		expect(getCurrentTenantId()).toBeUndefined();
	});

	it('lose only the one the backend rejected', () => {
		storeTenantToken('colleague', SUPPORT_ID, 'colleague-token');

		clearUserSession('invalidToken', undefined, undefined);

		expect(getTenantToken('agent', SUPPORT_ID)).toBeUndefined();
		expect(getTenantToken('agent', SALES_ID)).toBe('sales-token');
		expect(getTenantToken('colleague', SUPPORT_ID)).toBe('colleague-token');
	});

	it('of two accounts in the same inbox are kept apart', () => {
		storeTenantToken('colleague', SALES_ID, 'colleague-token');

		expect(getTenantToken('agent', SALES_ID)).toBe('sales-token');
		expect(getTenantToken('colleague', SALES_ID)).toBe('colleague-token');
	});

	it('are replaced by the token of an invite back into the inbox', () => {
		storeTenantToken('agent', SALES_ID, 'token-of-invite');

		expect(getTenantToken('agent', SALES_ID)).toBe('token-of-invite');
	});

	it('go when the legacy switcher changes the API host', () => {
		clearTenantTokens();

		expect(getTenantToken('agent', SALES_ID)).toBeUndefined();
	});
});

describe('A token for another inbox without the password', () => {
	it('is the one at hand when it works, with no session call', async () => {
		backend({ 'token-of-invite': 'agent' });

		expect(
			await getTokenWithoutPassword(SALES_ID, 'agent', 'token-of-invite')
		).toBe('token-of-invite');
		expect(authApi.fetchSessionToken).not.toHaveBeenCalled();
	});

	it('falls back to the saved one when the one at hand is rejected', async () => {
		storeTenantToken('agent', SALES_ID, 'sales-token');
		backend({ 'token-of-invite': 401, 'sales-token': 'agent' });

		expect(
			await getTokenWithoutPassword(SALES_ID, 'agent', 'token-of-invite')
		).toBe('sales-token');
	});

	it('drops a saved token the backend rejects or that is another account’s', async () => {
		storeTenantToken('agent', SALES_ID, 'revoked');
		storeTenantToken('agent', SUPPORT_ID, 'someone-else');
		backend({ revoked: 403, 'someone-else': 'colleague' });

		expect(await getTokenWithoutPassword(SALES_ID, 'agent')).toBeUndefined();
		expect(await getTokenWithoutPassword(SUPPORT_ID, 'agent')).toBeUndefined();
		expect(getTenantToken('agent', SALES_ID)).toBeUndefined();
		expect(getTenantToken('agent', SUPPORT_ID)).toBeUndefined();
	});

	it('keeps a saved token through a network error', async () => {
		storeTenantToken('agent', SALES_ID, 'sales-token');
		backend({});

		expect(await getTokenWithoutPassword(SALES_ID, 'agent')).toBeUndefined();
		expect(getTenantToken('agent', SALES_ID)).toBe('sales-token');
	});
});

describe('Accepting an invite', () => {
	const SALES = { id: SALES_ID, name: 'Acme Sales', phone_number: '49151' };

	it('keeps the new membership’s token for the account', async () => {
		storeTenantToken('agent', SALES_ID, 'invalidated-by-invite-back');
		tenantsApi.acceptInvite.mockResolvedValue({
			username: 'agent',
			tenant: SALES,
			token: 'token-of-invite',
		});

		await acceptInviteKeepingToken({ code: 'invite-code' });

		expect(getTenantToken('agent', SALES_ID)).toBe('token-of-invite');
	});

	it('works with a backend that sends no token', async () => {
		tenantsApi.acceptInvite.mockResolvedValue({
			username: 'agent',
			tenant: SALES,
		});

		expect(
			(await acceptInviteKeepingToken({ code: 'invite-code' })).tenant
		).toEqual(SALES);
		expect(getTenantToken('agent', SALES_ID)).toBeUndefined();
	});
});
