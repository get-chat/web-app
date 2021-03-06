import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import './styles/App.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { isLocalHost } from './helpers/URLHelper';
import { initStorageType } from './helpers/StorageHelper';
import packageJson from '../package.json';
import './i18n';
import axios from 'axios';
import { ApiService } from './api/ApiService';

// Init storage type
initStorageType();

// Load external config and render App
axios
	.get(`/config.json`)
	.then((response) => {
		const config = response.data;

		// It is needed for ChatMessageClass
		window.config = config;

		// Init Sentry
		if (!isLocalHost()) {
			Sentry.init({
				debug: true,
				dsn: config.APP_SENTRY_DSN,
				release: packageJson.version,
				integrations: [new Integrations.BrowserTracing()],
				tracesSampleRate: 0.01,
				beforeSend(event, hint) {
					// Check if it is an exception, and if so, show the report dialog
					if (event.exception) {
						Sentry.showReportDialog({ eventId: event.event_id });
					}
					return event;
				},
			});
		}

		const apiService = new ApiService(config.API_BASE_URL);

		ReactDOM.render(
			<App config={config} apiService={apiService} />,
			document.getElementById('root')
		);
	})
	.catch((error) => {
		console.error(error);
	});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
