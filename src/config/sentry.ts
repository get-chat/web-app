import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

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
			integrations: [new Integrations.BrowserTracing()],
			tracesSampleRate: 0.002,
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
