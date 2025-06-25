import { render } from '@testing-library/react';
import App from './App';

jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@src/contexts/AppConfigContext', () => ({
	AppConfigContext: {},
}));

jest.mock('@src/contexts/ApplicationContext', () => ({
	ApplicationContext: {},
}));

describe('App component', () => {
	test('it renders', () => {
		render(<App />);
	});
});
