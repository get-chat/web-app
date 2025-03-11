import { render } from '@testing-library/react';
import App from './App';

jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}));

describe('App component', () => {
	test('it renders', () => {
		render(<App />);
	});
});
