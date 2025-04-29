import { useEffect, useRef, useState } from 'react';
import { AppConfig } from '@src/config/application';
import useRefreshToken from '@src/hooks/init/useRefreshToken';
import useIntegrationApiBaseURL from '@src/hooks/init/useIntegrationApiBaseURL';

const useAppInit = () => {
	const [isLoading, setLoading] = useState(true);
	const configRef = useRef<AppConfig | null>(null);

	const { handle: handleIntegrationApiBaseURL } = useIntegrationApiBaseURL();
	const { handle: handleRefreshToken } = useRefreshToken();

	useEffect(() => {
		initApp();
	}, []);

	const initApp = async () => {
		configRef.current = window.config;
		await initRest();
	};

	const initRest = async () => {
		try {
			// Task 1
			await handleIntegrationApiBaseURL(configRef.current!!, () => {
				// Task 2
				handleRefreshToken(() => {
					// Finish loading
					setLoading(false);
				});
			});
		} catch (error) {
			console.error(error);
		}
	};

	return {
		isLoading,
		config: configRef.current,
	};
};

export default useAppInit;
