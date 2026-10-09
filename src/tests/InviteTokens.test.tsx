import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProviders } from '@src/__mocks__/test-utils';
import AcceptInviteDialog from '@src/components/InboxSwitcher/AcceptInviteDialog';
import Login from '@src/modules/Login';
import { Tenant } from '@src/types/tenants';
import axios from 'axios';
import api from '@src/api/axiosInstance';

jest.mock('@src/api/authApi');
jest.mock('@src/api/tenantsApi');
jest.mock('@src/helpers/StorageHelper');
// acceptInviteKeepingToken stays real: it saves the token (in the mocked
// storage) and calls the mocked acceptInvite
jest.mock('@src/helpers/InboxHelper', () => ({
	...jest.requireActual('@src/helpers/InboxHelper'),
	getTokenWithoutPassword: jest.fn(),
	loadTenants: jest.fn(),
	setAvailableOnEntry: jest.fn(),
}));
// The password dialog renders <Trans>, which the shared mock lacks
jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
	Trans: ({ children }: { children: React.ReactNode }) => children,
}));

const SUPPORT: Tenant = {
	id: 'aaaa1111',
	name: 'Acme Support',
	phone_number: '4915100000001',
};
const SALES: Tenant = {
	id: 'bbbb2222',
	name: 'Acme Sales',
	phone_number: '4915100000002',
};

const authApi = require('@src/api/authApi');
const tenantsApi = require('@src/api/tenantsApi');
const storage = require('@src/helpers/StorageHelper');
const inboxHelper = require('@src/helpers/InboxHelper');
const { useAppSelector } = require('@src/store/hooks');

// The store as the components see it: logged in as "agent" in Acme Support,
// with an invite link opened
const withState = (ui: object) =>
	useAppSelector.mockImplementation((selector: (state: any) => any) =>
		selector({
			UI: { hasFailedMessages: false, ...ui },
			currentUser: { value: { id: 1, username: 'agent' } },
			isUserAvailable: { value: false },
			isUserAvailabilityFeatureEnabled: { value: false },
			inboxes: {
				tenants: [SUPPORT],
				currentTenantId: SUPPORT.id,
				generation: 0,
			},
		})
	);

beforeAll(() => {
	// cmdk scrolls the highlighted row into view, which jsdom lacks
	Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
	jest.clearAllMocks();
	inboxHelper.loadTenants.mockResolvedValue({
		tenants: [SUPPORT, SALES],
		currentTenantId: SUPPORT.id,
	});
	// The token at hand works, nothing else is there (the real checks are
	// in TenantTokens.test.ts)
	inboxHelper.getTokenWithoutPassword.mockImplementation(
		async (tenantId: string, username: string, token?: string) => token
	);
});

describe('Accepting an invite in the app', () => {
	const user = userEvent.setup();

	const accept = async () => {
		withState({ inviteCode: 'invite-code' });
		render(
			<TestProviders>
				<AcceptInviteDialog />
			</TestProviders>
		);
		await user.click(screen.getByTestId('accept-invite'));
	};

	it('keeps the token, then opens the inbox with it without a password', async () => {
		tenantsApi.acceptInvite.mockResolvedValue({
			username: 'agent',
			tenant: SALES,
			token: 'token-of-invite',
		});

		await accept();

		await waitFor(() =>
			expect(storage.storeTenantToken).toHaveBeenCalledWith(
				'agent',
				SALES.id,
				'token-of-invite'
			)
		);
		// The new inbox joins the switcher
		expect(inboxHelper.loadTenants).toHaveBeenCalled();

		await user.click(await screen.findByRole('button', { name: 'Open %s' }));

		await waitFor(() =>
			expect(storage.storeToken).toHaveBeenCalledWith('token-of-invite')
		);
		expect(storage.storeCurrentTenantId).toHaveBeenCalledWith(SALES.id);
		// Checked like a saved token, then used
		expect(inboxHelper.getTokenWithoutPassword).toHaveBeenCalledWith(
			SALES.id,
			'agent',
			'token-of-invite'
		);
		expect(authApi.fetchSessionToken).not.toHaveBeenCalled();
		expect(authApi.login).not.toHaveBeenCalled();
		expect(screen.queryByText('Password of %s')).not.toBeInTheDocument();
		// Switching keeps the saved tokens
		expect(storage.removeTenantToken).not.toHaveBeenCalled();
		expect(storage.clearCurrentTenant).not.toHaveBeenCalled();
	});

	it('falls back to the usual ways when the backend sends no token', async () => {
		tenantsApi.acceptInvite.mockResolvedValue({
			username: 'agent',
			tenant: SALES,
		});

		await accept();

		await user.click(await screen.findByRole('button', { name: 'Open %s' }));

		await waitFor(() =>
			expect(inboxHelper.getTokenWithoutPassword).toHaveBeenCalledWith(
				SALES.id,
				'agent',
				undefined
			)
		);
		expect(storage.storeTenantToken).not.toHaveBeenCalled();
		// No token at hand: the password step
		expect(await screen.findByText('Password of %s')).toBeInTheDocument();
	});
});

describe('Switching inboxes', () => {
	const user = userEvent.setup();

	it('drops a late answer for the previous inbox before writing the new one', async () => {
		tenantsApi.acceptInvite.mockResolvedValue({
			username: 'agent',
			tenant: SALES,
			token: 'token-of-invite',
		});
		const adapter = api.defaults.adapter;
		// A request for the previous inbox, answered 401 only once the switch
		// has started writing the new inbox's state
		let answer401: () => void = () => {};
		api.defaults.adapter = (config) =>
			new Promise((_, reject) => {
				answer401 = () =>
					reject(
						Object.assign(new Error('Unauthorized'), {
							config,
							isAxiosError: true,
							response: { status: 401, config, data: {} },
						})
					);
			});
		try {
			const lateAnswer = api.get('/chats/').catch((error) => error);
			inboxHelper.setAvailableOnEntry.mockImplementation(async () => {
				expect(storage.storeToken).toHaveBeenCalledWith('token-of-invite');
				answer401();
			});

			withState({ inviteCode: 'invite-code' });
			render(
				<TestProviders>
					<AcceptInviteDialog />
				</TestProviders>
			);
			await user.click(screen.getByTestId('accept-invite'));
			await user.click(await screen.findByRole('button', { name: 'Open %s' }));

			// Dropped as cancelled, which every caller ignores: no 401
			// handling, so no logout and no token removed
			expect(axios.isCancel(await lateAnswer)).toBe(true);
		} finally {
			api.defaults.adapter = adapter;
			inboxHelper.setAvailableOnEntry.mockReset();
		}
	});
});

describe('Accepting an invite on the login card', () => {
	const user = userEvent.setup();

	const logInAndJoin = async () => {
		withState({ inviteCode: 'invite-code' });
		render(
			<TestProviders>
				<Login />
			</TestProviders>
		);
		await user.type(screen.getByLabelText(/Username/i), 'agent');
		await user.type(screen.getByLabelText(/^Password$/i), 'secret');
		await user.click(screen.getByRole('button', { name: 'Log in and join' }));
	};

	it('keeps the token and logs into the inbox with it', async () => {
		tenantsApi.acceptInvite.mockResolvedValue({
			username: 'agent',
			tenant: SALES,
			token: 'token-of-invite',
		});

		await logInAndJoin();

		await waitFor(() =>
			expect(storage.storeToken).toHaveBeenCalledWith('token-of-invite')
		);
		expect(storage.storeTenantToken).toHaveBeenCalledWith(
			'agent',
			SALES.id,
			'token-of-invite'
		);
		expect(storage.storeCurrentTenantId).toHaveBeenCalledWith(SALES.id);
		// No second login with the password
		expect(authApi.login).not.toHaveBeenCalled();
	});

	it('logs in with the password when the backend sends no token', async () => {
		tenantsApi.acceptInvite.mockResolvedValue({
			username: 'agent',
			tenant: SALES,
		});
		authApi.login.mockResolvedValue({ token: 'token-from-login' });

		await logInAndJoin();

		await waitFor(() =>
			expect(authApi.login).toHaveBeenCalledWith({
				username: 'agent',
				password: 'secret',
				tenant: SALES.id,
			})
		);
		await waitFor(() =>
			expect(storage.storeToken).toHaveBeenCalledWith('token-from-login')
		);
	});
});
