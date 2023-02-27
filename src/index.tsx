import { createRoot } from 'react-dom/client';

import App from '@src/App';
import { initStorageType } from '@src/helpers/StorageHelper';
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

		// TODO: Refactor global config
		window.config = config;

		initializeSentry(config);

		root.render(<App config={config} apiService={apiService} />);
	} catch (error) {
		console.error(error);
	}
};

initializeApp();
