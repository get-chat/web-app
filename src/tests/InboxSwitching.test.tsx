import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { TestProviders } from '@src/__mocks__/test-utils';
import Login from '@src/modules/Login';
import api, { startNewInboxGeneration } from '@src/api/axiosInstance';
import { store } from '@src/store';
import { setChats } from '@src/store/reducers/chatsReducer';
import { setReadOnly, setState } from '@src/store/reducers/UIReducer';
import {
	resetInboxState,
	setTenants,
} from '@src/store/reducers/inboxesReducer';
import { Tenant } from '@src/types/tenants';
import { filterInboxes } from '@src/components/InboxSwitcher/InboxList';

jest.mock('@src/api/authApi');
jest.mock('@src/helpers/StorageHelper');
jest.mock('@src/helpers/InboxHelper', () => ({
	setAvailableOnEntry: jest.fn(),
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

// The 400 of a password login for an account in several inboxes
const tenantChoiceRequired = {
	response: {
		status: 400,
		data: { reason: 'More than one inbox', tenants: [SUPPORT, SALES] },
	},
};

describe('Login of an account in several inboxes', () => {
	const user = userEvent.setup();
	const authApi = require('@src/api/authApi');
	const storage = require('@src/helpers/StorageHelper');

	beforeAll(() => {
		// cmdk scrolls the highlighted row into view, which jsdom lacks
		Element.prototype.scrollIntoView = jest.fn();
	});

	beforeEach(() => {
		jest.clearAllMocks();
		authApi.login.mockImplementation(({ tenant }: { tenant?: string }) =>
			tenant
				? Promise.resolve({ token: `token-of-${tenant}` })
				: Promise.reject(tenantChoiceRequired)
		);
	});

	const logIn = async () => {
		render(
			<TestProviders>
				<Login />
			</TestProviders>
		);
		await user.type(screen.getByLabelText(/Username/i), 'agent');
		await user.type(screen.getByLabelText(/Password/i), 'secret');
		await user.click(screen.getByRole('button', { name: /Log in/i }));
	};

	it('asks which inbox to open, then logs into it', async () => {
		storage.getLastTenantId.mockReturnValue(undefined);

		await logIn();

		expect(await screen.findByText('Choose an inbox')).toBeInTheDocument();
		const options = screen.getAllByTestId('inbox-option');
		expect(options).toHaveLength(2);

		await user.click(screen.getByText('Acme Sales'));

		await waitFor(() =>
			expect(authApi.login).toHaveBeenLastCalledWith({
				username: 'agent',
				password: 'secret',
				tenant: SALES.id,
			})
		);
		await waitFor(() =>
			expect(storage.storeToken).toHaveBeenCalledWith('token-of-bbbb2222')
		);
		expect(storage.storeCurrentTenantId).toHaveBeenCalledWith(SALES.id);
		expect(storage.storeTenantToken).toHaveBeenCalledWith(
			'agent',
			SALES.id,
			'token-of-bbbb2222'
		);
		expect(storage.storeLastTenantId).toHaveBeenCalledWith('agent', SALES.id);
	});

	it('goes straight into the inbox the username used last', async () => {
		storage.getLastTenantId.mockReturnValue(SALES.id);

		await logIn();

		await waitFor(() =>
			expect(storage.storeToken).toHaveBeenCalledWith('token-of-bbbb2222')
		);
		expect(authApi.login).toHaveBeenLastCalledWith({
			username: 'agent',
			password: 'secret',
			tenant: SALES.id,
		});
		expect(screen.queryByText('Choose an inbox')).not.toBeInTheDocument();
	});

	it('still reports a wrong password', async () => {
		authApi.login.mockRejectedValue({
			response: {
				status: 400,
				data: { non_field_errors: ['Unable to log in'] },
			},
		});

		await logIn();

		expect(
			await screen.findByText('Incorrect username or password.')
		).toBeInTheDocument();
		expect(screen.queryByText('Choose an inbox')).not.toBeInTheDocument();
	});
});

describe('Switching inboxes', () => {
	it('resets the per-inbox state and keeps the inbox list', () => {
		store.dispatch(
			setTenants({ tenants: [SUPPORT, SALES], currentTenantId: SUPPORT.id })
		);
		store.dispatch(setChats({ chat_1: {} as any }));
		store.dispatch(setReadOnly(true));
		store.dispatch(setState({ isContactDetailsVisible: true }));
		const generation = store.getState().inboxes.generation;

		store.dispatch(resetInboxState());

		const state = store.getState();
		expect(state.chats.value).toEqual({});
		expect(state.UI.isContactDetailsVisible).toBe(false);
		expect(state.UI.isReadOnly).toBe(true);
		expect(state.inboxes.tenants).toEqual([SUPPORT, SALES]);
		expect(state.inboxes.generation).toBe(generation + 1);
	});

	it('drops a response that arrives after the switch', async () => {
		const adapter = api.defaults.adapter;
		api.defaults.adapter = async (config) => {
			// The app switches inboxes while the request is on its way
			startNewInboxGeneration();
			return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
		};

		try {
			const error = await api.get('/chats/').catch((error) => error);
			expect(axios.isCancel(error)).toBe(true);

			// Requests sent after the switch go through
			api.defaults.adapter = async (config) => ({
				data: { ok: true },
				status: 200,
				statusText: 'OK',
				headers: {},
				config,
			});
			expect((await api.get('/chats/')).data).toEqual({ ok: true });
		} finally {
			api.defaults.adapter = adapter;
		}
	});
});

describe('Message drafts', () => {
	const storage = jest.requireActual('@src/helpers/StorageHelper');

	beforeEach(() => {
		window.localStorage.clear();
		storage.initStorageType();
	});

	it('are kept per inbox, the first inbox adopting the earlier drafts', () => {
		storage.storeMessageDraft('4915199999999', 'from before');

		storage.storeCurrentTenantId(SUPPORT.id);
		expect(storage.getMessageDraft('4915199999999')).toBe('from before');

		storage.storeCurrentTenantId(SALES.id);
		expect(storage.getMessageDraft('4915199999999')).toBeUndefined();
		storage.storeMessageDraft('4915199999999', 'for sales');

		storage.storeCurrentTenantId(SUPPORT.id);
		expect(storage.getMessageDraft('4915199999999')).toBe('from before');
	});

	it('of every inbox go on logout', () => {
		storage.storeCurrentTenantId(SUPPORT.id);
		storage.storeTenantToken('agent', SUPPORT.id, 'a');
		storage.storeMessageDraft('1', 'support draft');
		storage.storeCurrentTenantId(SALES.id);
		storage.storeTenantToken('agent', SALES.id, 'b');
		storage.storeMessageDraft('1', 'sales draft');

		storage.clearMessageDrafts();
		storage.clearCurrentTenant();

		expect(
			Object.keys(window.localStorage).filter((key) =>
				key.startsWith('message_drafts')
			)
		).toEqual([]);
		expect(storage.getCurrentTenantId()).toBeUndefined();
	});
});

describe('Inbox search', () => {
	const matches = (search: string, tenant: Tenant) =>
		filterInboxes(tenant.id, search, [tenant.name, tenant.phone_number]) > 0;
	const cafe: Tenant = {
		id: '9e8d7c6b5a4f43e2b1c0d9e8f7a6b5c4',
		name: 'Café Lumière',
		phone_number: '33142424242',
	};

	it('matches names without regard to case or accents', () => {
		expect(matches('cafe', cafe)).toBe(true);
		expect(matches('LUMI', cafe)).toBe(true);
	});

	it('matches numbers as typed, with or without formatting', () => {
		expect(matches('+33 142', cafe)).toBe(true);
	});

	it('does not match short searches against the id', () => {
		// "ca" and "4f" appear in the id but not in the name or number
		expect(matches('ca', SUPPORT)).toBe(false);
		expect(matches('4f', cafe)).toBe(false);
		expect(matches('9e8d7c6b', cafe)).toBe(true);
	});
});
