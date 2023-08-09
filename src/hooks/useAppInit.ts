import { useEffect, useRef, useState } from 'react';
import { AppConfig } from '@src/config/application';
import { ApiService } from '@src/api/ApiService';
import {
	getApiBaseURLs,
	getCurrentApiBaseURL,
	storeApiBaseURLs,
	storeCurrentApiBaseURL,
} from '@src/helpers/StorageHelper';
import { getIntegrationApiBaseURL } from '@src/helpers/URLHelper';
import { AxiosError } from 'axios';
import useIdToken from '@src/hooks/init/useIdToken';

const useAppInit = () => {
	const [isLoading, setLoading] = useState(true);
	const configRef = useRef<AppConfig | null>(null);
	const apiServiceRef = useRef<ApiService | null>(null);

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
			const completeInit = () => {
				handleIdToken(apiServiceRef.current!!, () => {
					// Finish loading
					setLoading(false);
				});
			};

			// Previously stored api base url
			const storedApiBaseURL = getCurrentApiBaseURL();

			// Get param: integration_api_base_url
			const integrationApiBaseURL = getIntegrationApiBaseURL();

			if (integrationApiBaseURL) {
				// Replace api base url of api service
				apiServiceRef.current!!.setApiBaseURL(integrationApiBaseURL);

				const inboxRespondsCallback = () => {
					storeCurrentApiBaseURL(integrationApiBaseURL);

					const apiBaseURLs = getApiBaseURLs();
					if (!apiBaseURLs.includes(integrationApiBaseURL)) {
						apiBaseURLs.push(integrationApiBaseURL);
						storeApiBaseURLs(apiBaseURLs);
					}

					completeInit();
				};

				// Make a request to inbox to check if integration api base url responds
				apiServiceRef.current!!.baseCall(
					() => {
						inboxRespondsCallback();
					},
					(error: AxiosError) => {
						console.log(error);

						// Keep integration api base url if status is 403
						// Status 403 means inbox is responding but user is not authenticated
						if (error.response?.status !== 403) {
							// Revert api base url
							apiServiceRef.current!!.setApiBaseURL(
								storedApiBaseURL ?? configRef.current!!.API_BASE_URL
							);
						}

						inboxRespondsCallback();
					}
				);
			} else {
				if (storedApiBaseURL) {
					apiServiceRef.current!!.setApiBaseURL(storedApiBaseURL);
				}

				completeInit();
			}
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
