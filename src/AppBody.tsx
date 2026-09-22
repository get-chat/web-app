import React, { useEffect, useState } from 'react';
import { isIPad13 } from 'react-device-detect';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import AppRoutes from '@src/AppRoutes';
import { useAppDispatch } from '@src/store/hooks';
import { setReadOnly, setState } from '@src/store/reducers/UIReducer';
import { isReadOnlyConfig } from '@src/helpers/ConfigHelper';
import useAppInit from '@src/hooks/useAppInit';
import { getURLParams } from '@src/helpers/URLHelper';

const AppBody: React.FC = () => {
	const [bgColor] = useState(getURLParams().get('bg_color'));

	const { isLoading, config } = useAppInit();

	const dispatch = useAppDispatch();

	// Read before the router mounts: it navigates /app -> /main -> /main/login
	// without the query string, so the login page can no longer see these
	useEffect(() => {
		const params = getURLParams();

		// Sent by the backend when a regular user opens their activation link:
		// they choose a password on the login card before they can log in
		const activationCode = params.get('set_password');
		if (activationCode) {
			dispatch(
				setState({
					activationCode,
					activatedUsername: params.get('username') ?? undefined,
				})
			);
		}

		if (params.get('account_activated') === '1') {
			dispatch(
				setState({
					isAccountActivated: true,
					activatedUsername: params.get('username') ?? undefined,
				})
			);
		}
	}, []);

	useEffect(() => {
		if (config) {
			// Update UI state initially
			dispatch(setReadOnly(isReadOnlyConfig(config)));
		}
	}, [config]);

	return (
		<div
			className={'app' + (isIPad13 ? ' absoluteFullscreen' : '')}
			style={bgColor ? { background: '#' + bgColor } : undefined}
		>
			{!isLoading && (
				<AppConfigContext.Provider value={config}>
					<ApplicationContext.Provider value={{}}>
						<AppRoutes />
					</ApplicationContext.Provider>
				</AppConfigContext.Provider>
			)}
		</div>
	);
};

export default AppBody;
