import axios from 'axios';
import { generateUniqueID } from '@src/helpers/Helpers';
import { getStorage, STORAGE_TAG_TOKEN } from '@src/helpers/StorageHelper';

const api = axios.create({
	baseURL: '',
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
		'X-Request-ID': generateUniqueID(),
	},
	withCredentials: true,
});

// Add request interceptor for auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('authToken');
		if (token) {
			config.headers.Authorization = `Token ${getStorage().getItem(
				STORAGE_TAG_TOKEN
			)}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

export default api;
