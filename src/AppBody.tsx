import React, { useEffect } from 'react';
import { isIPad13 } from 'react-device-detect';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import AppRoutes from '@src/AppRoutes';
import { AppConfig } from '@src/config/application';
import { ApiService } from '@src/api/ApiService';
import { useAppDispatch } from '@src/store/hooks';
import { setReadOnly } from '@src/store/reducers/UIReducer';
import { isReadOnlyConfig } from '@src/helpers/ConfigHelper';

interface Props {
	config: AppConfig;
	apiService: ApiService;
}

const AppBody: React.FC<Props> = ({ config, apiService }) => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		// Update UI state initially
		dispatch(setReadOnly(isReadOnlyConfig(config)));
	}, []);

	return (
		<div className={'app' + (isIPad13 ? ' absoluteFullscreen' : '')}>
			<AppConfigContext.Provider value={config}>
				<ApplicationContext.Provider
					value={{
						apiService,
					}}
				>
					<AppRoutes />
				</ApplicationContext.Provider>
			</AppConfigContext.Provider>
		</div>
	);
};

export default AppBody;
