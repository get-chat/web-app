import axios from "axios";
import PubSub from "pubsub-js";
import {BASE_URL, EVENT_TOPIC_FORCE_LOGOUT} from "../Constants";
import {getConfig, handleIfUnauthorized} from "../helpers/ApiHelper";
import { getStorage, STORAGE_TAG_TOKEN } from "../helpers/StorageHelper";

export class ApiService {

    constructor(apiBaseURL) {
        this.apiBaseURL = apiBaseURL;
    }

    handleRequest = (promise, successCallback, errorCallback, completeCallback, willHandleAuthError) => {
        promise.then((response) => {
            successCallback?.(response);
            if (completeCallback) {
                completeCallback();
            }
        }).catch((error) => {
            errorCallback?.(error);
            if (completeCallback) {
                completeCallback();
            }

            if (willHandleAuthError) {
                this.handleAuthError(error);
            }
        });
    }

    handleAuthError = (error) => {
        if (error.response) {
            if (error.response.status === 401 || error.response.status === 400) {
                console.warn('Unauthorized: ' + error.response.status);
                getStorage().removeItem(STORAGE_TAG_TOKEN);
                PubSub.publish(EVENT_TOPIC_FORCE_LOGOUT);
            }
        }
    }

    loginCall = (username, password, successCallback, errorCallback) => {
        axios.post(`${BASE_URL}auth/token/`, {
            username: username,
            password: password
        }).then((response) => {
            successCallback?.(response);
        }).catch((error) => {
            errorCallback?.(error);
        })
    }

    logoutCall = (successCallback) => {
        axios.get(`${BASE_URL}auth/logout/`, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    changePasswordCall = (currentPassword, newPassword, successCallback, errorCallback) => {
        axios.put(`${BASE_URL}users/password/change/`, {
            current_password: currentPassword,
            new_password: newPassword
        }, getConfig()).then((response) => {
            successCallback?.(response);
        }).catch((error) => {
            errorCallback?.(error);
        });
    }

    listChatsCall = (keyword, chatTagId, limit, offset, cancelToken, successCallback, errorCallback, history) => {
        axios.get(`${BASE_URL}chats/`,
            getConfig({
                search: keyword,
                chat_tag_id: chatTagId,
                limit: 18,
                offset: offset
            }, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
                handleIfUnauthorized(error, history);
                errorCallback?.(error);
            });
    }

    bulkSendCall = (body, successCallback) => {
        axios.post(`${BASE_URL}bulk_messages/`, body, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    listUsersCall = (limit, successCallback) => {
        axios.get(`${BASE_URL}users/`, getConfig({
            limit: limit
        }))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    retrieveCurrentUserCall = (successCallback, history) => {
        axios.get(`${BASE_URL}users/current/`, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
                handleIfUnauthorized(error, history);
            });
    }

    listTemplatesCall = (successCallback, errorCallback) => {
        axios.get(`${BASE_URL}templates/`, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                errorCallback?.(error);
            });
    }

    listSavedResponsesCall = (successCallback) => {
        axios.get(`${BASE_URL}saved_responses/`, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    createSavedResponseCall = (text, successCallback) => {
        axios.post(`${BASE_URL}saved_responses/`, {
            text: text
        }, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    deleteSavedResponseCall = (id, successCallback) => {
        axios.delete(`${BASE_URL}saved_responses/${id}/`, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    resolveContactCall = (personWaId, successCallback) => {
        axios.get(`${BASE_URL}contacts/${personWaId}`, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    listContactsCall = (search, limit, cancelToken, successCallback, errorCallback) => {
        axios.get(`${BASE_URL}contacts/`, getConfig({
            search: search,
            limit: limit
        }, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
                errorCallback?.(error);
            });
    }

    listTagsCall = (successCallback) => {
        axios.get(`${BASE_URL}tags/`, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    retrievePersonCall = (waId, cancelToken, successCallback, errorCallback) => {
        axios.get(`${BASE_URL}persons/${waId}/`, getConfig(undefined, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                errorCallback?.(error);
            });
    }

    listMessagesCall = (waId, search, chatTagId, limit, offset, beforeTime, sinceTime, cancelToken, successCallback,
                                     errorCallback, history) => {
        axios.get(`${BASE_URL}messages/`,
            getConfig({
                wa_id: waId,
                search: search,
                chat_tag_id: chatTagId,
                offset: offset ?? 0,
                before_time: beforeTime,
                since_time: sinceTime,
                limit: limit,
            }, cancelToken)
        )
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
                errorCallback?.(error);
                handleIfUnauthorized(error, history);
            });
    }

    listChatAssignmentEventsCall = (waId, beforeTime, sinceTime, cancelToken, successCallback) => {
        axios.get(`${BASE_URL}chat_assignment_events/`, getConfig({
            wa_id: waId,
            before_time: beforeTime,
            since_time: sinceTime,
        }, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    listChatTaggingEventsCall = (waId, beforeTime, sinceTime, cancelToken, successCallback) => {
        axios.get(`${BASE_URL}chat_tagging_events/`, getConfig({
            wa_id: waId,
            before_time: beforeTime,
            since_time: sinceTime,
        }, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    searchMessagesCall = (waId, search, limit, cancelToken, successCallback, errorCallback) => {
        axios.get( `${BASE_URL}messages/`,
            getConfig({
                wa_id: waId,
                search: search,
                //offset: offset ?? 0,
                limit: limit,
            }, cancelToken)
        )
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
                errorCallback?.(error);
            });
    }

    sendMessageCall = (body, successCallback, errorCallback) => {
        axios.post(`${BASE_URL}messages/`, body, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
                errorCallback?.(error);
            });
    }

    uploadMediaCall = (formData, successCallback, errorCallback) => {
        axios.post(`${BASE_URL}media/`, formData, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                if (error?.response?.status === 413) {
                    window.displayCustomError('The media file is too big to upload!');
                } else {
                    window.displayError(error);
                }
                errorCallback?.(error);
            });
    }

    markAsReceivedCall = (waId, timestamp, cancelToken, successCallback, history) => {
        axios.post(`${BASE_URL}mark_as_received/`, {
            customer_wa_id: waId,
            timestamp: timestamp
        }, getConfig(undefined, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
                handleIfUnauthorized(error, history);
            });
    }

    retrieveChatCall = (waId, successCallback) => {
        axios.get(`${BASE_URL}chats/${waId}/`, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    createChatTaggingCall = (waId, chatTaggingId, successCallback) => {
        axios.post(`${BASE_URL}chat_tagging/`, {
            chat: waId,
            tag: chatTaggingId
        }, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    deleteChatTaggingCall = (chatTaggingId, successCallback) => {
        axios.delete(`${BASE_URL}chat_tagging/${chatTaggingId}`, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    listPersonsCall = (search, cancelToken, successCallback, errorCallback) => {
        axios.get(`${BASE_URL}persons/`, getConfig({
            search: search
        }, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
                errorCallback?.(error);
            });
    }

    retrieveChatAssignmentCall = (waId, successCallback, errorCallback) => {
        axios.get(`${BASE_URL}chat_assignment/${waId}/`, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                if (error?.response?.status !== 403) {
                    window.displayError(error);
                }
                errorCallback?.(error);
            });
    }

    updateChatAssignmentCall = (waId, assignedToUser, assignedGroup, successCallback, errorCallback) => {
        axios.put(`${BASE_URL}chat_assignment/${waId}/`, {
            'wa_id': waId,
            'assigned_to_user': assignedToUser,
            'assigned_group': assignedGroup,
        }, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                if (error?.response?.status !== 403) {
                    window.displayError(error);
                }
                errorCallback?.(error);
            });
    }

    listGroupsCall = (successCallback) => {
        axios.get(`${BASE_URL}groups/`, getConfig())
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    verifyContactsCall = (contacts, cancelToken, successCallback, errorCallback) => {
        axios.post(`${BASE_URL}contacts/verify/`, {
            blocking: "wait",
            contacts: contacts,
            force_check: true
        }, getConfig(undefined, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
                errorCallback?.(error);
            });
    }

    retrieveBusinessProfileCall = (cancelToken, successCallback) => {
        axios.get(`${BASE_URL}settings/business/profile/`, getConfig(undefined, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    updateBusinessProfileCall = (address, description, email, vertical, websites, cancelToken, successCallback,
                                              errorCallback) => {
        axios.patch(`${BASE_URL}settings/business/profile/`, {
            address: address,
            description: description,
            email: email,
            vertical: vertical,
            websites: Object.values(websites)
        }, getConfig(undefined, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
                errorCallback?.(error);
            });
    }

    retrieveProfileAboutCall = (cancelToken, successCallback) => {
        axios.get(`${BASE_URL}settings/profile/about/`, getConfig(undefined, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    updateProfileAboutCall = (about, cancelToken, successCallback, errorCallback) => {
        axios.patch( `${BASE_URL}settings/profile/about/`, {
            text: about
        }, getConfig(undefined, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
                errorCallback?.(error);
            });
    }

    retrieveProfilePhotoCall = (cancelToken, successCallback, errorCallback) => {
        axios.get(`${BASE_URL}settings/profile/photo/`,
            getConfig(undefined, cancelToken, 'arraybuffer'))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                errorCallback?.(error);
            });
    }

    updateProfilePhotoCall = (formData, cancelToken, successCallback, errorCallback) => {
        axios.post( `${BASE_URL}settings/profile/photo/`, formData, getConfig(undefined, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
                errorCallback?.(error);
            });
    }

    deleteProfilePhotoCall = (cancelToken, successCallback) => {
        axios.delete(`${BASE_URL}settings/profile/photo/`, getConfig(undefined, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    retrieveBulkMessageTaskElementsCall = (cancelToken, successCallback, errorCallback) => {
        axios.get(`${BASE_URL}bulk_message_elements/`,
            getConfig(undefined, cancelToken))
            .then((response) => {
                successCallback?.(response);
            })
            .catch((error) => {
                errorCallback?.(error);
            });
    }

}