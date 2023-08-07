import React from 'react';
import { Provider } from 'react-redux';
import AppTheme from './AppTheme';
import { store } from './store';
import { ThemeProvider } from '@mui/material';
import AppBody from '@src/AppBody';

const App: React.FC = () => {
	return (
		<Provider store={store}>
			<ThemeProvider theme={AppTheme}>
				<AppBody />
			</ThemeProvider>
		</Provider>
	);
};

export default App;
