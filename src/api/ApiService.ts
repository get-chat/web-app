// @ts-nocheck
import axios from 'axios';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_FORCE_LOGOUT } from '../Constants';
import { getRequestConfig } from '../helpers/ApiHelper';
import { getStorage, STORAGE_TAG_TOKEN } from '../helpers/StorageHelper';
import { AppConfig } from '@src/config/application';

export class ApiService {
	public apiBaseURL: string = '';
	public config: AppConfig;

	constructor(config: AppConfig) {
		this.config = config;
		this.apiBaseURL = config.API_BASE_URL;
	}

	setApiBaseURL = (url: string) => {
		this.apiBaseURL = url;
	};

	handleRequest = (
		promise,
		successCallback,
		errorCallback,
		completeCallback,
		willHandleAuthError
	) => {
		promise
			.then((response) => {
				successCallback?.(response);
				if (completeCallback) {
					completeCallback();
				}
			})
			.catch((error) => {
				errorCallback?.(error);
				if (completeCallback) {
					completeCallback();
				}

				if (willHandleAuthError) {
					this.handleAuthError(error);
				}
			});
	};

	handleAuthError = (error) => {
		if (error.response) {
			if (error.response.status === 401) {
				console.warn('Unauthorized: ' + error.response.status);
				getStorage().removeItem(STORAGE_TAG_TOKEN);
				PubSub.publish(EVENT_TOPIC_FORCE_LOGOUT);
			}
		}
	};

	baseCall = (successCallback, errorCallback) => {
		this.handleRequest(
			axios.get(this.apiBaseURL, getRequestConfig()),
			successCallback,
			errorCallback
		);
	};

	uploadMediaCall = (formData, successCallback, errorCallback) => {
		this.handleRequest(
			axios.post(`${this.apiBaseURL}media/`, formData, getRequestConfig()),
			successCallback,
			(error) => {
				if (error?.response?.status === 413) {
					window.displayCustomError('The media file is too big to upload!');
				} else {
					window.displayError(error);
				}
				errorCallback?.(error);
			}
		);
	};

	retrieveProfilePhotoCall = (cancelToken, successCallback, errorCallback) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}settings/profile/photo/`,
				getRequestConfig(undefined, cancelToken, 'arraybuffer')
			),
			successCallback,
			errorCallback
		);
	};

	updateProfilePhotoCall = (
		formData,
		cancelToken,
		successCallback,
		errorCallback
	) => {
		this.handleRequest(
			axios.post(
				`${this.apiBaseURL}settings/profile/photo/`,
				formData,
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			(error) => {
				window.displayError(error);
				errorCallback?.(error);
			}
		);
	};

	deleteProfilePhotoCall = (cancelToken, successCallback) => {
		this.handleRequest(
			axios.delete(
				`${this.apiBaseURL}settings/profile/photo/`,
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			(error) => {
				window.displayError(error);
			}
		);
	};
}
