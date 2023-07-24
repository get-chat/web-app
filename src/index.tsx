import { createRoot } from 'react-dom/client';

import App from '@src/App';
import {
	getApiBaseURLs,
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

initStorageType();

const domNode = document.getElementById('root');
const root = createRoot(domNode as Element);

const initializeApp = async () => {
	try {
		const config = await loadAppConfig();
		const apiService = new ApiService(config);

		const urlParams = new URLSearchParams(window.location.search);
		const integrationApiBaseURL = urlParams
			.get('integration_api_base_url')
			?.trim();

		if (integrationApiBaseURL) {
			console.log(integrationApiBaseURL);
			apiService.setApiBaseURL(integrationApiBaseURL);
			storeCurrentApiBaseURL(integrationApiBaseURL);

			const apiBaseURLs = getApiBaseURLs();
			if (!apiBaseURLs.includes(integrationApiBaseURL)) {
				apiBaseURLs.push(integrationApiBaseURL);
				storeApiBaseURLs(apiBaseURLs);
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
