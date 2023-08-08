import React, { useEffect } from 'react';
import { isIPad13 } from 'react-device-detect';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import AppRoutes from '@src/AppRoutes';
import { useAppDispatch } from '@src/store/hooks';
import { setReadOnly } from '@src/store/reducers/UIReducer';
import { isReadOnlyConfig } from '@src/helpers/ConfigHelper';
import useAppInit from '@src/hooks/useAppInit';

const AppBody: React.FC = () => {
	const { isLoading, config, apiService } = useAppInit();

	const dispatch = useAppDispatch();

	useEffect(() => {
		if (config) {
			// Update UI state initially
			dispatch(setReadOnly(isReadOnlyConfig(config)));
		}
	}, [config]);

	return (
		<div className={'app' + (isIPad13 ? ' absoluteFullscreen' : '')}>
			{!isLoading && apiService && (
				<AppConfigContext.Provider value={config}>
					<ApplicationContext.Provider
						value={{
							apiService: apiService,
						}}
					>
						<AppRoutes />
					</ApplicationContext.Provider>
				</AppConfigContext.Provider>
			)}
		</div>
	);
};

export default AppBody;
