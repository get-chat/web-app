import { createRoot } from 'react-dom/client';

import App from '@src/App';
import { initStorageType } from '@src/helpers/StorageHelper';
import '@src/i18n';
import '@src/styles/index.css';
import '@src/styles/App.css';
import { loadAppConfig } from '@src/config/application';
import api from '@src/api/axiosInstance';
import { initializeSentry } from '@src/config/sentry';

initStorageType();

const domNode = document.getElementById('root');
const root = createRoot(domNode as Element);

const initializeApp = async () => {
	try {
		const config = await loadAppConfig();
		window.config = config;

		// Update API base URL
		api.defaults.baseURL = config.API_BASE_URL;

		initializeSentry(config);

		root.render(<App />);
	} catch (error) {
		console.error(error);
	}
};

initializeApp();
