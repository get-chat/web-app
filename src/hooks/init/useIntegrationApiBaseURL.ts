import { ApiService } from '@src/api/ApiService';
import {
	getApiBaseURLs,
	getCurrentApiBaseURL,
	storeApiBaseURLs,
	storeCurrentApiBaseURL,
} from '@src/helpers/StorageHelper';
import { getIntegrationApiBaseURL } from '@src/helpers/URLHelper';
import { AxiosError } from 'axios';
import { AppConfig } from '@src/config/application';

const useIntegrationApiBaseURL = () => {
	const handle = (
		apiService: ApiService,
		config: AppConfig,
		onComplete?: () => void
	) => {
		// Previously stored api base url
		const storedApiBaseURL = getCurrentApiBaseURL();

		// Get param: integration_api_base_url
		const integrationApiBaseURL = getIntegrationApiBaseURL();

		if (integrationApiBaseURL) {
			// Replace api base url of api service
			apiService.setApiBaseURL(integrationApiBaseURL);

			const inboxRespondsCallback = () => {
				storeCurrentApiBaseURL(integrationApiBaseURL);

				const apiBaseURLs = getApiBaseURLs();
				if (!apiBaseURLs.includes(integrationApiBaseURL)) {
					apiBaseURLs.push(integrationApiBaseURL);
					storeApiBaseURLs(apiBaseURLs);
				}

				onComplete?.();
			};

			// Make a request to inbox to check if integration api base url responds
			apiService.baseCall(
				() => {
					inboxRespondsCallback();
				},
				(error: AxiosError) => {
					console.log(error);

					// Keep integration api base url if status is 403
					// Status 403 means inbox is responding but user is not authenticated
					if (error.response?.status !== 403) {
						// Revert api base url
						apiService.setApiBaseURL(storedApiBaseURL ?? config.API_BASE_URL);
					}

					inboxRespondsCallback();
				}
			);
		} else {
			if (storedApiBaseURL) {
				apiService.setApiBaseURL(storedApiBaseURL);
			}

			onComplete?.();
		}
	};

	return {
		handle,
	};
};

export default useIntegrationApiBaseURL;
