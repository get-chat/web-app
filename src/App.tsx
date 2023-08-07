import React from 'react';
import { Provider } from 'react-redux';
import AppTheme from './AppTheme';
import { store } from './store';
import { ThemeProvider } from '@mui/material';
import { ApiService } from '@src/api/ApiService';
import { AppConfig } from '@src/config/application';
import AppBody from '@src/AppBody';

interface Props {
	config: AppConfig;
	apiService: ApiService;
}

const App: React.FC<Props> = ({ config, apiService }) => {
	return (
		<Provider store={store}>
			<ThemeProvider theme={AppTheme}>
				<AppBody config={config} apiService={apiService} />
			</ThemeProvider>
		</Provider>
	);
};

export default App;
