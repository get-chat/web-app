// @ts-nocheck
import React from 'react';
import './styles/index.css';
import './styles/App.css';
import App from './App';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { isLocalHost } from './helpers/URLHelper';
import { initStorageType } from './helpers/StorageHelper';
import packageJson from '../package.json';
import './i18n';
import axios from 'axios';
import { ApiService } from './api/ApiService';
import { isEmptyString } from './helpers/Helpers';
import { createRoot } from 'react-dom/client';

// Init storage type
initStorageType();

// Load external config and render App
axios
	.get(`/config.json`)
	.then((response) => {
		const config = response.data;

		// TODO: Refactor global config
		window.config = config;

		// Init Sentry
		if (!isLocalHost()) {
			Sentry.init({
				debug: true,
				dsn: config.APP_SENTRY_DSN,
				release: packageJson.version,
				integrations: [new Integrations.BrowserTracing()],
				tracesSampleRate: 0.002,
				ignoreErrors: ['ResizeObserver loop limit exceeded'],
				beforeSend(event, hint) {
					// Check if it is an exception, and if so, show the report dialog
					if (event.exception) {
						Sentry.showReportDialog({ eventId: event.event_id });
					}
					return event;
				},
			});

			if (!isEmptyString(config.APP_SENTRY_TAG_CLIENT)) {
				Sentry.setTag('client', config.APP_SENTRY_TAG_CLIENT);
			}
		}

		const apiService = new ApiService(config);

		const container = document.getElementById('root');
		const root = createRoot(container);
		root.render(<App config={config} apiService={apiService} />);
	})
	.catch((error) => {
		console.error(error);
	});
