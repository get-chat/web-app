import axios, { InternalAxiosRequestConfig } from 'axios';
import { generateUniqueID } from '@src/helpers/Helpers';
import { getStorage, STORAGE_TAG_TOKEN } from '@src/helpers/StorageHelper';

const api = axios.create({
	baseURL: '',
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
		'X-Request-ID': generateUniqueID(),
	},
});

// Bumped when the app switches to another inbox: a response to a request
// sent for the previous inbox must not land in the new one's state
let inboxGeneration = 0;

export const startNewInboxGeneration = () => {
	inboxGeneration += 1;
};

type StampedConfig = InternalAxiosRequestConfig & { inboxGeneration?: number };

// Add request interceptor for auth token
api.interceptors.request.use(
	(config: StampedConfig) => {
		const token = getStorage().getItem(STORAGE_TAG_TOKEN);
		// A token passed with the request wins (e.g. trying another inbox's)
		if (token && !config.headers.Authorization) {
			config.headers.Authorization = `Token ${token}`;
		}
		config.inboxGeneration = inboxGeneration;
		return config;
	},
	(error) => Promise.reject(error)
);

// Answers for the previous inbox are dropped as cancelled, which every
// caller already ignores
const isFromPreviousInbox = (config?: StampedConfig) =>
	config?.inboxGeneration !== undefined &&
	config.inboxGeneration !== inboxGeneration;

api.interceptors.response.use(
	(response) =>
		isFromPreviousInbox(response.config)
			? Promise.reject(
					new axios.CanceledError(undefined, undefined, response.config)
			  )
			: response,
	(error) =>
		Promise.reject(
			isFromPreviousInbox(error?.config)
				? new axios.CanceledError(undefined, undefined, error.config)
				: error
		)
);

export default api;
