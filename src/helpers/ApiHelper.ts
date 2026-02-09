import {
	clearContactProvidersData,
	clearMessageDrafts,
	clearToken,
	getStorage,
	STORAGE_TAG_TOKEN,
} from './StorageHelper';
import axios, {
	AxiosError,
	AxiosRequestConfig,
	CancelToken,
	CancelTokenSource,
} from 'axios';
import { generateUniqueID } from '@src/helpers/Helpers';
import { ResponseType } from 'axios';
import { NavigateFunction, Location } from 'react-router-dom';

export const generateCancelToken = (): CancelTokenSource => {
	return axios.CancelToken.source();
};

export const getRequestConfig = (
	params?: any,
	cancelToken?: CancelToken,
	responseType?: ResponseType,
	timeout?: number
) => {
	const requestConfig: AxiosRequestConfig = {
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

export const handleIfUnauthorized = (
	error: AxiosError | undefined,
	navigate: NavigateFunction | undefined
) => {
	if (error?.response?.status === 401) {
		clearUserSession('invalidToken', undefined, navigate);
	}
};

export const clearUserSession = (
	errorCase: string | undefined,
	nextLocation: Location | undefined,
	navigate: NavigateFunction | undefined
) => {
	clearToken();
	clearContactProvidersData();
	clearMessageDrafts();

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
