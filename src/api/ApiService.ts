// @ts-nocheck
import axios from 'axios';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_FORCE_LOGOUT } from '../Constants';
import {
	clearUserSession,
	getRequestConfig,
	handleIfUnauthorized,
} from '../helpers/ApiHelper';
import { getStorage, STORAGE_TAG_TOKEN } from '../helpers/StorageHelper';

export class ApiService {
	public apiBaseURL: string = '';

	constructor(config) {
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

	listHealthStatus = (successCallback, errorCallback) => {
		this.handleRequest(
			axios.get(`${this.apiBaseURL}status/health/`, getRequestConfig()),
			successCallback,
			errorCallback
		);
	};

	loginCall = (username, password, successCallback, errorCallback) => {
		this.handleRequest(
			axios.post(`${this.apiBaseURL}auth/token/`, {
				username: username,
				password: password,
			}),
			successCallback,
			errorCallback
		);
	};

	convertIdTokenCall = (
		idToken,
		successCallback,
		errorCallback,
		completeCallback
	) => {
		this.handleRequest(
			axios.post(`${this.apiBaseURL}auth/convert_id_token/`, {
				id_token: idToken,
			}),
			successCallback,
			errorCallback,
			completeCallback
		);
	};

	logoutCall = (successCallback) => {
		this.handleRequest(
			axios.get(`${this.apiBaseURL}auth/logout/`, getRequestConfig()),
			successCallback,
			(error) => {
				window.displayError(error);
			}
		);
	};

	changePasswordCall = (
		currentPassword,
		newPassword,
		successCallback,
		errorCallback
	) => {
		this.handleRequest(
			axios.put(
				`${this.apiBaseURL}users/password/change/`,
				{
					current_password: currentPassword,
					new_password: newPassword,
				},
				getRequestConfig()
			),
			successCallback,
			errorCallback
		);
	};

	listChatsCall = (
		dynamicFilters,
		keyword,
		chatTagId,
		limit,
		offset,
		assignedToMe,
		assignedGroup,
		messagesBeforeTime,
		messagesSinceTime,
		cancelToken,
		successCallback,
		errorCallback,
		history
	) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}chats/`,
				getRequestConfig(
					{
						...dynamicFilters,
						search: keyword,
						chat_tag_id: chatTagId,
						limit: limit,
						offset: offset,
						assigned_to_me: assignedToMe,
						assigned_group: assignedGroup,
						messages_before_time: messagesBeforeTime,
						messages_since_time: messagesSinceTime,
					},
					cancelToken,
					undefined,
					0
				)
			),
			successCallback,
			(error) => {
				window.displayError(error);
				handleIfUnauthorized(error, history);
				errorCallback?.(error);
			}
		);
	};

	bulkSendCall = (body, successCallback) => {
		this.handleRequest(
			axios.post(`${this.apiBaseURL}bulk_messages/`, body, getRequestConfig()),
			successCallback,
			(error) => {
				window.displayError(error);
			}
		);
	};

	listUsersCall = (limit, successCallback) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}users/`,
				getRequestConfig({
					limit: limit,
				})
			),
			successCallback,
			(error) => {
				window.displayError(error);
			}
		);
	};

	retrieveCurrentUserCall = (successCallback, history) => {
		this.handleRequest(
			axios.get(`${this.apiBaseURL}users/current/`, getRequestConfig()),
			successCallback,
			(error) => {
				window.displayError(error);

				// Exceptional handling for invalid token
				if (error?.response?.status === 403) {
					clearUserSession('invalidToken', undefined, history);
				} else {
					handleIfUnauthorized(error, history);
				}
			}
		);
	};

	issueTemplateRefreshRequestCall = (
		cancelToken,
		successCallback,
		errorCallback
	) => {
		this.handleRequest(
			axios.post(
				`${this.apiBaseURL}templates/refresh/issue/`,
				{},
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			errorCallback
		);
	};

	checkTemplateRefreshStatusCall = (
		cancelToken,
		successCallback,
		errorCallback
	) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}templates/refresh/status/`,
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			errorCallback
		);
	};

	listTemplatesCall = (cancelToken, successCallback, errorCallback) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}templates/`,
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			errorCallback
		);
	};

	listSavedResponsesCall = (successCallback) => {
		this.handleRequest(
			axios.get(`${this.apiBaseURL}saved_responses/`, getRequestConfig()),
			successCallback,
			(error) => {
				window.displayError(error);
			}
		);
	};

	createSavedResponseCall = (text, successCallback) => {
		this.handleRequest(
			axios.post(
				`${this.apiBaseURL}saved_responses/`,
				{
					text: text,
				},
				getRequestConfig()
			),
			successCallback,
			(error) => {
				window.displayError(error);
			}
		);
	};

	deleteSavedResponseCall = (id, successCallback) => {
		this.handleRequest(
			axios.delete(
				`${this.apiBaseURL}saved_responses/${id}/`,
				getRequestConfig()
			),
			successCallback,
			(error) => {
				window.displayError(error);
			}
		);
	};

	resolveContactCall = (personWaId, successCallback, errorCallback) => {
		this.handleRequest(
			axios.get(`${this.apiBaseURL}contacts/${personWaId}`, getRequestConfig()),
			successCallback,
			errorCallback
		);
	};

	listContactsCall = (
		search,
		limit,
		pages,
		cancelToken,
		successCallback,
		errorCallback
	) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}contacts/`,
				getRequestConfig(
					{
						search: search,
						limit: limit,
						pages: pages,
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

	listTagsCall = (successCallback) => {
		this.handleRequest(
			axios.get(`${this.apiBaseURL}tags/`, getRequestConfig()),
			successCallback,
			(error) => {
				window.displayError(error);
			}
		);
	};

	retrievePersonCall = (waId, cancelToken, successCallback, errorCallback) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}persons/${waId}/`,
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			errorCallback
		);
	};

	listMessagesCall = (
		waId,
		search,
		chatTagId,
		limit,
		offset,
		assignedToMe,
		assignedGroup,
		beforeTime,
		sinceTime,
		cancelToken,
		successCallback,
		errorCallback,
		history
	) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}messages/`,
				getRequestConfig(
					{
						wa_id: waId,
						search: search,
						chat_tag_id: chatTagId,
						offset: offset ?? 0,
						assigned_to_me: assignedToMe,
						assigned_group: assignedGroup,
						before_time: beforeTime,
						since_time: sinceTime,
						limit: limit,
					},
					cancelToken
				)
			),
			successCallback,
			(error) => {
				errorCallback?.(error);
				handleIfUnauthorized(error, history);
			}
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

	searchMessagesCall = (
		waId,
		search,
		limit,
		cancelToken,
		successCallback,
		errorCallback
	) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}messages/`,
				getRequestConfig(
					{
						wa_id: waId,
						search: search,
						limit: limit,
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

	sendMessageCall = (body, successCallback, errorCallback) => {
		this.handleRequest(
			axios.post(`${this.apiBaseURL}messages/`, body, getRequestConfig()),
			successCallback,
			(error) => {
				window.displayError(error);
				errorCallback?.(error);
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

	retrieveChatCall = (waId, cancelToken, successCallback, errorCallback) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}chats/${waId}/`,
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			errorCallback
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

	listGroupsCall = (cancelToken?, successCallback?, errorCallback?) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}groups/`,
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

	retrieveBulkMessageTaskElementsCall = (
		cancelToken,
		successCallback,
		errorCallback
	) => {
		this.handleRequest(
			axios.get(
				`${this.apiBaseURL}bulk_message_elements/`,
				getRequestConfig(undefined, cancelToken)
			),
			successCallback,
			errorCallback
		);
	};
}
