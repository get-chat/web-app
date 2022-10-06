import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@material-ui/styles';
import {
	BrowserRouter as Router,
	Route,
	Switch as RouteSwitch,
} from 'react-router-dom';

import Login from './components/Login';
import Main from './components/Main/Main';
import AppTheme from './AppTheme';
import { isIPad13 } from 'react-device-detect';
import { ApplicationContext } from './contexts/ApplicationContext';
import { AppConfig } from './contexts/AppConfig';
import configureAppStore from './store';

const store = configureAppStore({});

function App({ config, apiService }) {
	return (
		<Provider store={store}>
			<ThemeProvider theme={AppTheme}>
				<div className={'app' + (isIPad13 ? ' absoluteFullscreen' : '')}>
					<AppConfig.Provider value={config}>
						<ApplicationContext.Provider
							value={{
								apiService,
							}}
						>
							<Router>
								<RouteSwitch>
									<Route
										path={[
											'/main/chat/:waId',
											'/main/chat/:waId/message/:msgId',
											'/main',
										]}
										component={Main}
									/>
									<Route
										path={['/login/error/:errorCase', '/']}
										component={Login}
									/>
								</RouteSwitch>
							</Router>
						</ApplicationContext.Provider>
					</AppConfig.Provider>
				</div>
			</ThemeProvider>
		</Provider>
	);
}

export default App;
