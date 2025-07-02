import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProviders } from '@src/__mocks__/test-utils';
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
