import axios from 'axios';

const api = axios.create({
	baseURL: '',
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

// Add request interceptor for auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('authToken');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

export default api;
