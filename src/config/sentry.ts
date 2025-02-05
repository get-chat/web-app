import * as Sentry from '@sentry/react';

import { isLocalHost } from '@src/helpers/URLHelper';
import { isEmptyString } from '@src/helpers/Helpers';
// @ts-ignore next-line
import packageJson from '../../package.json';

import type { AppConfig } from './application';
import i18next from 'i18next';

export const initializeSentry = (config: AppConfig) => {
	if (!isLocalHost()) {
		Sentry.init({
			debug: true,
			dsn: config.APP_SENTRY_DSN,
			release: packageJson.version,
			integrations: [
				Sentry.browserTracingIntegration(),
				Sentry.replayIntegration(),
			],

			// Tracing
			tracesSampleRate: 0.002,
			// Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
			tracePropagationTargets: ['*'],
			// Session Replay
			replaysSessionSampleRate: 0.002, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
			replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.

			ignoreErrors: ['ResizeObserver loop limit exceeded'],
			beforeSend(event) {
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

		Sentry.setTag('browser_locale', navigator.language);
		Sentry.setTag('page_locale', i18next.resolvedLanguage);
	}
};
