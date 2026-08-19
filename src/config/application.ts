import axios from 'axios';

export interface AppConfig {
	API_BASE_URL: string;
	APP_SENTRY_DSN: string;
	APP_ENV_NAME: string;
	APP_SENTRY_TAG_CLIENT: string;
	APP_NOTIFICATIONS_LIMIT_PER_MINUTE: string;
	APP_GOOGLE_MAPS_API_KEY: string;
	APP_GOOGLE_MAPS_MAP_ID?: string;
	APP_IS_READ_ONLY: string;
	APP_IS_REGULAR_USER_ACTIONS_RESTRICTED: string;
	APP_IS_360DIALOG_LOGIN_ENABLED?: string;
	// Where the "Login with 360dialog" flow should send the user back to,
	// with a refresh_token query parameter appended (for forked deployments
	// whose public URL differs from the current location, e.g. behind a
	// proxy). Defaults to the current page. Must be allowed by the backend
	// (INBOX_SSO_ALLOWED_REDIRECT_URLS).
	APP_360DIALOG_LOGIN_REDIRECT_URL?: string;
}

export const loadAppConfig = async (): Promise<AppConfig> => {
	try {
		const response = await axios.get('/config.json');
		return response.data;
	} catch (error) {
		const response = await axios.get('./config.json');
		return response.data;
	}
};
