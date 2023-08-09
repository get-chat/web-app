import { useEffect, useRef, useState } from 'react';
import { AppConfig } from '@src/config/application';
import { ApiService } from '@src/api/ApiService';
import useIdToken from '@src/hooks/init/useIdToken';
import useIntegrationApiBaseURL from '@src/hooks/init/useIntegrationApiBaseURL';

const useAppInit = () => {
	const [isLoading, setLoading] = useState(true);
	const configRef = useRef<AppConfig | null>(null);
	const apiServiceRef = useRef<ApiService | null>(null);

	const { handle: handleIntegrationApiBaseURL } = useIntegrationApiBaseURL();
	const { handle: handleIdToken } = useIdToken();

	useEffect(() => {
		initApp();
	}, []);

	const initApp = async () => {
		await initApiService();
		await initRest();
	};

	const initApiService = async () => {
		const config = window.config;
		configRef.current = config;
		apiServiceRef.current = new ApiService(config);
	};

	const initRest = async () => {
		try {
			// Task 1
			handleIntegrationApiBaseURL(
				apiServiceRef.current!!,
				configRef.current!!,
				() => {
					// Task 2
					handleIdToken(apiServiceRef.current!!, () => {
						// Finish loading
						setLoading(false);
					});
				}
			);
		} catch (error) {
			console.error(error);
		}
	};

	return {
		isLoading,
		config: configRef.current,
		apiService: apiServiceRef.current,
	};
};

export default useAppInit;
