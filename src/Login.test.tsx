import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '@src/App';
import { login as mockLogin } from './api/authApi';

// Enhanced mocks
const mockNavigate = jest.fn();
const mockLocation = {
	state: null,
	search: '',
	pathname: '/login',
	hash: '',
};

// Mock localStorage
const localStorageMock = (function () {
	let store: Record<string, string> = {};
	return {
		getItem: jest.fn((key: string) => store[key] || null),
		setItem: jest.fn((key: string, value: string) => {
			store[key] = value.toString();
		}),
		clear: jest.fn(() => {
			store = {};
		}),
		removeItem: jest.fn((key: string) => {
			delete store[key];
		}),
	};
})();

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
});

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useNavigate: () => mockNavigate,
	useLocation: () => mockLocation,
}));

jest.mock('./api/authApi');

describe('Login functionality', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		window.localStorage.clear();
		mockLocation.state = null;
		mockLocation.search = '';
		mockLocation.pathname = '/login';
	});

	it('should complete login flow successfully', async () => {
		// Mock successful login
		(mockLogin as jest.Mock).mockImplementation(async () => {
			return { token: 'fake-token' };
		});

		render(<App />);

		// Fill form
		fireEvent.change(screen.getByLabelText(/username/i), {
			target: { value: 'testuser' },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: 'testpass' },
		});

		// Submit form
		fireEvent.click(screen.getByRole('button', { name: /log in/i }));

		// Verify API call
		await waitFor(() => {
			expect(mockLogin).toHaveBeenCalledWith({
				username: 'testuser',
				password: 'testpass',
			});
		});

		// Verify token storage
		await waitFor(
			() => {
				expect(localStorage.setItem).toHaveBeenCalledWith(
					expect.any(String), // or your specific token key
					'fake-token'
				);
			},
			{ timeout: 3000 }
		);

		// Verify navigation
		await waitFor(
			() => {
				expect(mockNavigate).toHaveBeenCalledWith('/main');
			},
			{ timeout: 3000 }
		);
	});

	it('should handle location state', async () => {
		// Setup
		mockLocation.state = { nextPath: '/dashboard', search: '?tab=1' };
		(mockLogin as jest.Mock).mockResolvedValue({ token: 'fake-token' });

		render(<App />);

		// Fill form
		fireEvent.change(screen.getByLabelText(/username/i), {
			target: { value: 'testuser' },
		});
		fireEvent.change(screen.getByLabelText(/password/i), {
			target: { value: 'testpass' },
		});

		// Submit form
		fireEvent.click(screen.getByRole('button', { name: /log in/i }));

		// Verify navigation with custom path
		await waitFor(
			() => {
				expect(mockNavigate).toHaveBeenCalledWith('/dashboard?tab=1');
			},
			{ timeout: 3000 }
		);
	});
});
