import {
	clearContactProvidersData,
	clearToken,
	getStorage,
	STORAGE_TAG_TOKEN,
} from './StorageHelper';
import axios from 'axios';

export const generateCancelToken = () => {
	return axios.CancelToken.source();
};

export const getRequestConfig = (
	params,
	cancelToken,
	responseType,
	timeout
) => {
	const requestConfig = {
		withCredentials: false,
		params,
		headers: {
			Authorization: 'Token ' + getStorage().getItem(STORAGE_TAG_TOKEN),
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		cancelToken: cancelToken,
	};

	if (responseType !== undefined) {
		requestConfig.responseType = responseType;
	}

	if (timeout !== undefined) {
		requestConfig.timeout = timeout;
	}

	return requestConfig;
};

export const handleIfUnauthorized = (error, history) => {
	if (error?.response?.status === 401) {
		clearUserSession('invalidToken', undefined, history);
	}
};

export const clearUserSession = (errorCase, nextLocation, history) => {
	clearToken();
	clearContactProvidersData();

	let path;

	if (errorCase) {
		path = `/login/error/${errorCase}`;
	} else {
		path = '/';
	}

	if (history !== undefined) {
		history.push({
			pathname: path,
			nextPath: nextLocation?.pathname,
			search: nextLocation?.search,
		});
	}
};
