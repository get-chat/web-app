// @ts-nocheck
import {
	clearContactProvidersData,
	clearToken,
	getStorage,
	STORAGE_TAG_TOKEN,
} from './StorageHelper';
import axios, { CancelTokenSource } from 'axios';
import { generateUniqueID } from '@src/helpers/Helpers';

export const generateCancelToken = (): CancelTokenSource => {
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
			'X-Request-ID': generateUniqueID(),
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

export const handleIfUnauthorized = (error, navigate) => {
	if (error?.response?.status === 401) {
		clearUserSession('invalidToken', undefined, navigate);
	}
};

export const clearUserSession = (errorCase, nextLocation, navigate) => {
	clearToken();
	clearContactProvidersData();

	let path;

	if (errorCase) {
		path = `/main/login/error/${errorCase}`;
	} else {
		path = '/';
	}

	if (navigate) {
		navigate(path, {
			state: {
				nextPath: nextLocation?.pathname,
				search: nextLocation?.search,
			},
		});
	}
};
