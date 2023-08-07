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
import { AppConfigContext } from './contexts/AppConfigContext';
import { store } from './store';
import { ThemeProvider } from '@mui/material';
import { ApiService } from '@src/api/ApiService';
import { AppConfig } from '@src/config/application';

interface Props {
	config: AppConfig;
	apiService: ApiService;
}

const App = ({ config, apiService }: Props) => {
	const renderPaths = (paths: string[], Element: JSX.Element) =>
		paths.map((path) => <Route key={path} path={path} element={Element} />);

	return (
		<Provider store={store}>
			<ThemeProvider theme={AppTheme}>
				<div className={'app' + (isIPad13 ? ' absoluteFullscreen' : '')}>
					<AppConfigContext.Provider value={config}>
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
					</AppConfigContext.Provider>
				</div>
			</ThemeProvider>
		</Provider>
	);
};

export default App;
