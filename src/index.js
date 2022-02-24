import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import './styles/App.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import {isLocalHost} from "./helpers/URLHelper";
import {initStorageType} from "./helpers/StorageHelper";
import {VERSION} from "./Constants";

import './i18n';

// Init Sentry
if (!isLocalHost()) {
    Sentry.init({
        dsn: process.env.REACT_APP_SENTRY_DSN,
        release: VERSION,
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

// Init storage type
initStorageType();

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
