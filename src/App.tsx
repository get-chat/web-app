import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import AppBody from '@src/AppBody';
import { TooltipProvider } from '@src/components/ui/tooltip';
import { Toaster } from '@src/components/ui/sonner';

const App: React.FC = () => {
	return (
		<Provider store={store}>
			<TooltipProvider>
				<AppBody />
				<Toaster />
			</TooltipProvider>
		</Provider>
	);
};

export default App;
