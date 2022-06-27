import axios from 'axios';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_FORCE_LOGOUT } from '../Constants';
import { getConfig, handleIfUnauthorized } from '../helpers/ApiHelper';
import { getStorage, STORAGE_TAG_TOKEN } from '../helpers/StorageHelper';

export class ApiService {
    constructor(apiBaseURL) {
        this.apiBaseURL = apiBaseURL;
    }

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
            axios.get(this.apiBaseURL, getConfig()),
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

    logoutCall = (successCallback) => {
        this.handleRequest(
            axios.get(`${this.apiBaseURL}auth/logout/`, getConfig()),
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
                getConfig()
            ),
            successCallback,
            errorCallback
        );
    };

    listChatsCall = (
        keyword,
        chatTagId,
        limit,
        offset,
        cancelToken,
        successCallback,
        errorCallback,
        history
    ) => {
        this.handleRequest(
            axios.get(
                `${this.apiBaseURL}chats/`,
                getConfig(
                    {
                        search: keyword,
                        chat_tag_id: chatTagId,
                        limit: 18,
                        offset: offset,
                    },
                    cancelToken
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
            axios.post(`${this.apiBaseURL}bulk_messages/`, body, getConfig()),
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
                getConfig({
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
            axios.get(`${this.apiBaseURL}users/current/`, getConfig()),
            successCallback,
            (error) => {
                window.displayError(error);
                handleIfUnauthorized(error, history);
            }
        );
    };

    listTemplatesCall = (successCallback, errorCallback) => {
        this.handleRequest(
            axios.get(`${this.apiBaseURL}templates/`, getConfig()),
            successCallback,
            errorCallback
        );
    };

    listSavedResponsesCall = (successCallback) => {
        this.handleRequest(
            axios.get(`${this.apiBaseURL}saved_responses/`, getConfig()),
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
                getConfig()
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
                getConfig()
            ),
            successCallback,
            (error) => {
                window.displayError(error);
            }
        );
    };

    resolveContactCall = (personWaId, successCallback, errorCallback) => {
        this.handleRequest(
            axios.get(`${this.apiBaseURL}contacts/${personWaId}`, getConfig()),
            successCallback,
            errorCallback
        );
    };

    listContactsCall = (
        search,
        limit,
        cancelToken,
        successCallback,
        errorCallback
    ) => {
        this.handleRequest(
            axios.get(
                `${this.apiBaseURL}contacts/`,
                getConfig(
                    {
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

    listTagsCall = (successCallback) => {
        this.handleRequest(
            axios.get(`${this.apiBaseURL}tags/`, getConfig()),
            successCallback,
            (error) => {
                window.displayError(error);
            }
        );
    };

    retrievePersonCall = (
        waId,
        cancelToken,
        successCallback,
        errorCallback
    ) => {
        this.handleRequest(
            axios.get(
                `${this.apiBaseURL}persons/${waId}/`,
                getConfig(undefined, cancelToken)
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
                getConfig(
                    {
                        wa_id: waId,
                        search: search,
                        chat_tag_id: chatTagId,
                        offset: offset ?? 0,
                        before_time: beforeTime,
                        since_time: sinceTime,
                        limit: limit,
                    },
                    cancelToken
                )
            ),
            successCallback,
            (error) => {
                window.displayError(error);
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
                getConfig(
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
                getConfig(
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
                getConfig(
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
            axios.post(`${this.apiBaseURL}messages/`, body, getConfig()),
            successCallback,
            (error) => {
                window.displayError(error);
                errorCallback?.(error);
            }
        );
    };

    uploadMediaCall = (formData, successCallback, errorCallback) => {
        this.handleRequest(
            axios.post(`${this.apiBaseURL}media/`, formData, getConfig()),
            successCallback,
            (error) => {
                if (error?.response?.status === 413) {
                    window.displayCustomError(
                        'The media file is too big to upload!'
                    );
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
        history
    ) => {
        this.handleRequest(
            axios.post(
                `${this.apiBaseURL}mark_as_received/`,
                {
                    customer_wa_id: waId,
                    timestamp: timestamp,
                },
                getConfig(undefined, cancelToken)
            ),
            successCallback,
            (error) => {
                window.displayError(error);
                handleIfUnauthorized(error, history);
            }
        );
    };

    retrieveChatCall = (waId, successCallback) => {
        this.handleRequest(
            axios.get(`${this.apiBaseURL}chats/${waId}/`, getConfig()),
            successCallback,
            (error) => {
                window.displayError(error);
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
                getConfig()
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
                getConfig()
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
                getConfig(
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
                getConfig()
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
                getConfig()
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

    listGroupsCall = (successCallback) => {
        this.handleRequest(
            axios.get(`${this.apiBaseURL}groups/`, getConfig()),
            successCallback,
            (error) => {
                window.displayError(error);
            }
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
                getConfig(undefined, cancelToken)
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
                getConfig(undefined, cancelToken)
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
                getConfig(undefined, cancelToken)
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
                getConfig(undefined, cancelToken)
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
                getConfig(undefined, cancelToken)
            ),
            successCallback,
            (error) => {
                window.displayError(error);
                errorCallback?.(error);
            }
        );
    };

    retrieveProfilePhotoCall = (
        cancelToken,
        successCallback,
        errorCallback
    ) => {
        this.handleRequest(
            axios.get(
                `${this.apiBaseURL}settings/profile/photo/`,
                getConfig(undefined, cancelToken, 'arraybuffer')
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
                getConfig(undefined, cancelToken)
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
                getConfig(undefined, cancelToken)
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
                getConfig(undefined, cancelToken)
            ),
            successCallback,
            errorCallback
        );
    };
}
