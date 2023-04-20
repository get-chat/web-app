// @ts-nocheck
import React from 'react';
import { Provider } from 'react-redux';
import {
	BrowserRouter as Router,
	Navigate,
	Route,
	Routes,
} from 'react-router-dom';

import Login from './components/Login';
import Main from './components/Main/Main';
import AppTheme from './AppTheme';
import { isIPad13 } from 'react-device-detect';
import { ApplicationContext } from './contexts/ApplicationContext';
import { AppConfig } from './contexts/AppConfig';
import { store } from './store';
import { ThemeProvider } from '@mui/material';

const App = ({ config, apiService }) => {
	const renderPaths = (paths, Element) =>
		paths.map((path) => <Route key={path} path={path} element={Element} />);

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
								<Routes>
									<Route path="/app" element={<Navigate to="/main" />} />
									{renderPaths(
										[
											'/main/chat/:waId',
											'/main/chat/:waId/message/:msgId',
											'/main',
										],
										<Main />
									)}

									{renderPaths(
										[
											'/main/login',
											'main/login/error',
											'/main/login/error/:errorCase',
											'/',
										],
										<Login />
									)}
									<Route path="*" element={<Navigate to="/main" />} />
								</Routes>
							</Router>
						</ApplicationContext.Provider>
					</AppConfig.Provider>
				</div>
			</ThemeProvider>
		</Provider>
	);
};

export default App;
