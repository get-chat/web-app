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

initStorageType();

const domNode = document.getElementById('root');
const root = createRoot(domNode as Element);

const initializeApp = async () => {
	try {
		const config = await loadAppConfig();
		const apiService = new ApiService(config);

		const integrationApiBaseURL = getIntegrationApiBaseURL();

		if (integrationApiBaseURL) {
			apiService.setApiBaseURL(integrationApiBaseURL);
			storeCurrentApiBaseURL(integrationApiBaseURL);

			const apiBaseURLs = getApiBaseURLs();
			if (!apiBaseURLs.includes(integrationApiBaseURL)) {
				apiBaseURLs.push(integrationApiBaseURL);
				storeApiBaseURLs(apiBaseURLs);
			}
		} else {
			const storedApiBaseURL = getCurrentApiBaseURL();
			if (storedApiBaseURL) {
				apiService.setApiBaseURL(storedApiBaseURL);
			}
		}

		// TODO: Refactor global config
		window.config = config;

		initializeSentry(config);

		root.render(<App config={config} apiService={apiService} />);
	} catch (error) {
		console.error(error);
	}
};

initializeApp();
