import React from 'react';
import { Provider } from 'react-redux';
import AppTheme from './AppTheme';
import { store } from './store';
import { ThemeProvider } from '@mui/material';
import AppBody from '@src/AppBody';
import { TooltipProvider } from '@src/components/ui/tooltip';

const App: React.FC = () => {
	return (
		<Provider store={store}>
			<ThemeProvider theme={AppTheme}>
				<TooltipProvider>
					<AppBody />
				</TooltipProvider>
			</ThemeProvider>
		</Provider>
	);
};

export default App;
