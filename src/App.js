import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/Login';
import Main from './components/Main/Main';
import AppTheme from './AppTheme';
import { isIPad13 } from 'react-device-detect';
import { ApplicationContext } from './contexts/ApplicationContext';
import { AppConfig } from './contexts/AppConfig';
import configureAppStore from './store';

const store = configureAppStore({});

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
									{renderPaths(
										[
											'/main/chat/:waId',
											'/main/chat/:waId/message/:msgId',
											'/main',
										],
										<Main />
									)}

									{renderPaths(['/login/error/:errorCase', '/'], <Login />)}
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
