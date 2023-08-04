import { createRoot } from 'react-dom/client';

import App from '@src/App';
import {
	getApiBaseURLs,
	getCurrentApiBaseURL,
	initStorageType,
	storeApiBaseURLs,
	storeCurrentApiBaseURL,
} from '@src/helpers/StorageHelper';
import { ApiService } from '@src/api/ApiService';
import { loadAppConfig } from '@src/config/application';
import { initializeSentry } from '@src/config/sentry';

import '@src/i18n';
import '@src/styles/index.css';
import '@src/styles/App.css';
import { getIntegrationApiBaseURL } from '@src/helpers/URLHelper';
import { AxiosError } from 'axios';

initStorageType();

const domNode = document.getElementById('root');
const root = createRoot(domNode as Element);

const initializeApp = async () => {
	try {
		const config = await loadAppConfig();
		const apiService = new ApiService(config);

		const completeInit = () => {
			// TODO: Refactor global config
			window.config = config;

			initializeSentry(config);

			root.render(<App config={config} apiService={apiService} />);
		};

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

				completeInit();
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

			completeInit();
		}
	} catch (error) {
		console.error(error);
	}
};

initializeApp();
