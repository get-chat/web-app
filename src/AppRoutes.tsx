import React from 'react';
import {
	BrowserRouter as Router,
	Navigate,
	Route,
	Routes,
} from 'react-router-dom';

import Login from './components/Login';
import Main from './components/Main/Main';
import RefreshTokenErrorPage from '@src/components/RefreshTokenErrorPage';

const AppRoutes: React.FC = () => {
	const renderPaths = (paths: string[], Element: JSX.Element) =>
		paths.map((path) => <Route key={path} path={path} element={Element} />);

	return (
		<Router basename={process.env.PUBLIC_URL}>
			<Routes>
				<Route path="/app" element={<Navigate to="/main" />} />
				{renderPaths(
					['/main/chat/:waId', '/main/chat/:waId/message/:msgId', '/main'],
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
				<Route path="/id_token_error" element={<RefreshTokenErrorPage />} />
				<Route path="*" element={<Navigate to="/main" />} />
			</Routes>
		</Router>
	);
};

export default AppRoutes;
