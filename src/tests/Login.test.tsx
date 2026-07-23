import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { TestProviders } from '@src/__mocks__/test-utils';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import Login from '@src/modules/Login';

jest.mock('@src/api/authApi');
jest.mock('@src/helpers/StorageHelper');

describe('Login Component - Successful Login', () => {
	const user = userEvent.setup();

	beforeEach(() => {
		// Clear all mocks before each test
		jest.clearAllMocks();

		// Setup default mock implementations
		require('@src/api/authApi').login.mockResolvedValue({
			token: 'test-token-123',
		});
	});

	it('successfully logs in and stores token', async () => {
		render(
			<TestProviders>
				<Login />
			</TestProviders>
		);

		// Get form elements
		const usernameInput = screen.getByLabelText(/Username/i);
		const passwordInput = screen.getByLabelText(/Password/i);
		const submitButton = screen.getByRole('button', { name: /Log in/i });

		// Fill out and submit form
		await user.type(usernameInput, 'testuser');
		await user.type(passwordInput, 'testpass');
		await user.click(submitButton);

		// Verify API call
		await waitFor(() => {
			expect(require('@src/api/authApi').login).toHaveBeenCalledWith({
				username: 'testuser',
				password: 'testpass',
			});
		});

		// Verify token storage
		await waitFor(() => {
			expect(
				require('@src/helpers/StorageHelper').storeToken
			).toHaveBeenCalledWith('test-token-123');
		});
	});
});

describe('Login Component - Login with 360dialog', () => {
	const renderWithConfig = (config: object, initialEntries = ['/']) =>
		render(
			<ThemeProvider theme={createTheme()}>
				<AppConfigContext.Provider
					// @ts-ignore
					value={config}
				>
					<MemoryRouter initialEntries={initialEntries}>
						<Login />
					</MemoryRouter>
				</AppConfigContext.Provider>
			</ThemeProvider>
		);

	it('is visible by default (enabled unless explicitly disabled)', () => {
		// Covers an absent key and the empty value that config.json gets when
		// the backend env var is unset
		renderWithConfig({ API_BASE_URL: 'http://test-api.com' });
		expect(screen.getByTestId('login-with-360dialog')).toBeInTheDocument();

		renderWithConfig({
			API_BASE_URL: 'http://test-api.com',
			APP_IS_360DIALOG_LOGIN_ENABLED: '',
		});
		expect(
			screen.getAllByTestId('login-with-360dialog').length
		).toBeGreaterThan(0);
	});

	it('is hidden only when explicitly disabled', () => {
		renderWithConfig({
			API_BASE_URL: 'http://test-api.com',
			APP_IS_360DIALOG_LOGIN_ENABLED: 'false',
		});

		expect(
			screen.queryByTestId('login-with-360dialog')
		).not.toBeInTheDocument();
	});

	it('is visible when enabled via config', () => {
		renderWithConfig({
			API_BASE_URL: 'http://test-api.com',
			APP_IS_360DIALOG_LOGIN_ENABLED: 'true',
		});

		expect(screen.getByTestId('login-with-360dialog')).toBeInTheDocument();
	});

	it('displays the error reported by the SSO flow', () => {
		renderWithConfig(
			{
				API_BASE_URL: 'http://test-api.com',
				APP_IS_360DIALOG_LOGIN_ENABLED: 'true',
			},
			['/?360dialog_login_error=unauthorized']
		);

		expect(
			screen.getByText(
				'Your 360dialog account does not have access to this inbox. Please try again with another account.'
			)
		).toBeInTheDocument();
	});
});
