import axios from 'axios';

export interface AppConfig {
	API_BASE_URL: string;
	APP_SENTRY_DSN: string;
	APP_ENV_NAME: string;
	APP_SENTRY_TAG_CLIENT: string;
	APP_NOTIFICATIONS_LIMIT_PER_MINUTE: string;
	APP_GOOGLE_MAPS_API_KEY: string;
	APP_IS_READ_ONLY: string;
	APP_IS_USER_AVAILABILITY_ENABLED: string;
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
