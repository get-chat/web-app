import React, { useEffect, useState } from 'react';
import { isIPad13 } from 'react-device-detect';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import AppRoutes from '@src/AppRoutes';
import { useAppDispatch } from '@src/store/hooks';
import { setReadOnly } from '@src/store/reducers/UIReducer';
import { isReadOnlyConfig } from '@src/helpers/ConfigHelper';
import useAppInit from '@src/hooks/useAppInit';
import { getURLParams } from '@src/helpers/URLHelper';

const AppBody: React.FC = () => {
	const [bgColor] = useState(getURLParams().get('bg_color'));

	const { isLoading, config } = useAppInit();

	const dispatch = useAppDispatch();

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
