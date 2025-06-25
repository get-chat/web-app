import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@src/contexts/AppConfigContext', () => {
	const React = require('react');
	return {
		__esModule: true,
		AppConfigContext: React.createContext({}),
	};
});

jest.mock('@src/contexts/ApplicationContext', () => {
	const React = require('react');
	return {
		__esModule: true,
		ApplicationContext: React.createContext({}),
	};
});

describe('App component', () => {
	test('it renders', () => {
		render(<App />);
	});
});
