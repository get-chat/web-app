// @ts-nocheck
import axios from 'axios';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_FORCE_LOGOUT } from '../Constants';
import { getRequestConfig, handleIfUnauthorized } from '../helpers/ApiHelper';
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

	listChatAssignmentEventsCall = (
		waId,
		beforeTime,
		sinceTime,
		cancelToken,
		successCallback
	) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}chat_assignment_events/`,
				getRequestConfig(
					{
						wa_id: waId,
						before_time: beforeTime,
						since_time: sinceTime,
					},
					cancelToken
				)
			),
			successCallback,
			(error) => {
				window.displayError(error);
			}
		);
	};

	listChatTaggingEventsCall = (
		waId,
		beforeTime,
		sinceTime,
		cancelToken,
		successCallback
	) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}chat_tagging_events/`,
				getRequestConfig(
					{
						wa_id: waId,
						before_time: beforeTime,
						since_time: sinceTime,
					},
					cancelToken
				)
			),
			successCallback,
			(error) => {
				window.displayError(error);
			}
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

	markAsReceivedCall = (
		waId,
		timestamp,
		cancelToken,
		successCallback,
		errorCallback,
		history
	) => {
		this.handleRequest(
			axios.post(
				`${this.apiBaseURL}mark_as_received/`,
				{
					customer_wa_id: waId,
					timestamp: timestamp,
				},
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			(error) => {
				handleIfUnauthorized(error, history);
			}
		);
	};

	createChatTaggingCall = (waId, chatTaggingId, successCallback) => {
		this.handleRequest(
			axios.post(
				`${this.apiBaseURL}chat_tagging/`,
				{
					chat: waId,
					tag: chatTaggingId,
				},
				getRequestConfig()
			),
			successCallback,
			(error) => {
				window.displayError(error);
			}
		);
	};

	deleteChatTaggingCall = (chatTaggingId, successCallback) => {
		this.handleRequest(
			axios.delete(
				`${this.apiBaseURL}chat_tagging/${chatTaggingId}`,
				getRequestConfig()
			),
			successCallback,
			(error) => {
				window.displayError(error);
			}
		);
	};

	listPersonsCall = (search, cancelToken, successCallback, errorCallback) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}persons/`,
				getRequestConfig(
					{
						search: search,
					},
					cancelToken
				)
			),
			successCallback,
			(error) => {
				window.displayError(error);
				errorCallback?.(error);
			}
		);
	};

	retrieveChatAssignmentCall = (waId, successCallback, errorCallback) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}chat_assignment/${waId}/`,
				getRequestConfig()
			),
			successCallback,
			(error) => {
				if (error?.response?.status !== 403) {
					window.displayError(error);
				}
				errorCallback?.(error);
			}
		);
	};

	updateChatAssignmentCall = (
		waId,
		assignedToUser,
		assignedGroup,
		successCallback,
		errorCallback
	) => {
		this.handleRequest(
			axios.put(
				`${this.apiBaseURL}chat_assignment/${waId}/`,
				{
					wa_id: waId,
					assigned_to_user: assignedToUser,
					assigned_group: assignedGroup,
				},
				getRequestConfig()
			),
			successCallback,
			(error) => {
				if (error?.response?.status !== 403) {
					window.displayError(error);
				}
				errorCallback?.(error);
			}
		);
	};

	partialUpdateChatAssignmentCall = (
		waId,
		assignedToUser,
		assignedGroup,
		cancelToken,
		successCallback,
		errorCallback
	) => {
		const data = {
			wa_id: waId,
		};

		if (assignedToUser !== undefined) {
			data.assigned_to_user = assignedToUser;
		}

		if (assignedGroup !== undefined) {
			data.assigned_group = assignedGroup;
		}

		this.handleRequest(
			axios.patch(
				`${this.apiBaseURL}chat_assignment/${waId}/`,
				data,
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			errorCallback
		);
	};

	verifyContactsCall = (
		contacts,
		cancelToken,
		successCallback,
		errorCallback
	) => {
		this.handleRequest(
			axios.post(
				`${this.apiBaseURL}contacts/verify/`,
				{
					blocking: 'wait',
					contacts: contacts,
					force_check: true,
				},
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			(error) => {
				window.displayError(error);
				errorCallback?.(error);
			}
		);
	};

	retrieveBusinessProfileCall = (cancelToken, successCallback) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}settings/business/profile/`,
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			(error) => {
				window.displayError(error);
			}
		);
	};

	updateBusinessProfileCall = (
		address,
		description,
		email,
		vertical,
		websites,
		cancelToken,
		successCallback,
		errorCallback
	) => {
		this.handleRequest(
			axios.patch(
				`${this.apiBaseURL}settings/business/profile/`,
				{
					address: address,
					description: description,
					email: email,
					vertical: vertical,
					websites: Object.values(websites),
				},
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			(error) => {
				window.displayError(error);
				errorCallback?.(error);
			}
		);
	};

	retrieveProfileAboutCall = (cancelToken, successCallback) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}settings/profile/about/`,
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			(error) => {
				window.displayError(error);
			}
		);
	};

	updateProfileAboutCall = (
		about,
		cancelToken,
		successCallback,
		errorCallback
	) => {
		this.handleRequest(
			axios.patch(
				`${this.apiBaseURL}settings/profile/about/`,
				{
					text: about,
				},
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			(error) => {
				window.displayError(error);
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
