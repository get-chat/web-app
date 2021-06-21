import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../helpers/Helpers";
import {handleIfUnauthorized} from "../helpers/ApiHelper";

export const generateCancelToken = () => {
    return axios.CancelToken.source();
}

export const baseCall = (callback, errorCallback) => {
    axios.get(BASE_URL, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            errorCallback?.(error);
        });
}

export const loginCall = (username, password, callback, errorCallback) => {
    axios.post(`${BASE_URL}auth/token/`, {
        username: username,
        password: password
    }).then((response) => {
        callback?.(response);
    }).catch((error) => {
        errorCallback?.(error);
    })
}

export const logoutCall = (callback) => {
    axios.get(`${BASE_URL}auth/logout/`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const changePasswordCall = (currentPassword, newPassword, callback, errorCallback) => {
    axios.put(`${BASE_URL}users/password/change/`, {
        current_password: currentPassword,
        new_password: newPassword
    }, getConfig()).then((response) => {
        callback?.(response);
    }).catch((error) => {
        errorCallback?.(error);
    });
}

export const listChatsCall = (keyword, limit, offset, cancelToken, callback, history) => {
    axios.get(`${BASE_URL}chats/`,
        getConfig({
            search: keyword,
            limit: 18,
            offset: offset
        }, cancelToken))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
            handleIfUnauthorized(error, history);
        });
}

export const bulkSendCall = (body, callback) => {
    axios.post(`${BASE_URL}messages/`, body, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const listUsersCall = (limit, callback) => {
    axios.get(`${BASE_URL}users/`, getConfig({
        limit: limit
    }))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const retrieveCurrentUserCall = (callback, history) => {
    axios.get(`${BASE_URL}users/current/`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
            handleIfUnauthorized(error, history);
        });
}

export const listTemplatesCall = (callback) => {
    axios.get(`${BASE_URL}templates/`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const listSavedResponsesCall = (callback) => {
    axios.get(`${BASE_URL}saved_responses/`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const createSavedResponseCall = (text, callback) => {
    axios.post(`${BASE_URL}saved_responses/`, {
        text: text
    }, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const deleteSavedResponseCall = (id, callback) => {
    axios.delete(`${BASE_URL}saved_responses/${id}/`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const resolveContactCall = (personWaId, callback) => {
    axios.get(`${BASE_URL}contacts/${personWaId}`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const listContactsCall = (search, limit, cancelToken, callback) => {
    axios.get(`${BASE_URL}contacts/`, getConfig({
        search: search,
        limit: limit
    }, cancelToken))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const listTagsCall = (callback) => {
    axios.get(`${BASE_URL}tags/`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const retrievePersonCall = (waId, cancelToken, callback, errorCallback) => {
    axios.get(`${BASE_URL}persons/${waId}/`, getConfig(undefined, cancelToken))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            errorCallback?.(error);
        });
}

export const listMessagesCall = (waId, search, limit, offset, beforeTime, sinceTime, cancelToken, callback,
                                 errorCallback, history) => {
    axios.get(`${BASE_URL}messages/`,
        getConfig({
            wa_id: waId,
            search: search,
            offset: offset ?? 0,
            before_time: beforeTime,
            since_time: sinceTime,
            limit: limit,
        }, cancelToken)
    )
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
            errorCallback?.(error);
            handleIfUnauthorized(error, history);
        });
}

export const listChatAssignmentEventsCall = (waId, beforeTime, sinceTime, cancelToken, callback) => {
    axios.get(`${BASE_URL}chat_assignment_events/`, getConfig({
        wa_id: waId,
        before_time: beforeTime,
        since_time: sinceTime,
    }, cancelToken))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const listChatTaggingEventsCall = (waId, beforeTime, sinceTime, cancelToken, callback) => {
    axios.get(`${BASE_URL}chat_tagging_events/`, getConfig({
        wa_id: waId,
        before_time: beforeTime,
        since_time: sinceTime,
    }, cancelToken))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const sendMessageCall = (body, callback, errorCallback) => {
    axios.post(`${BASE_URL}messages/`, body, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
            errorCallback?.(error);
        });
}

export const uploadMediaCall = (formData, callback, errorCallback) => {
    axios.post(`${BASE_URL}media/`, formData, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
            errorCallback?.(error);
        });
}

export const markAsReceivedCall = (waId, timestamp, cancelToken, callback, history) => {
    axios.post(`${BASE_URL}mark_as_received/`, {
        customer_wa_id: waId,
        timestamp: timestamp
    }, getConfig(undefined, cancelToken))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
            handleIfUnauthorized(error, history);
        });
}

export const retrieveChatCall = (waId, callback) => {
    axios.get(`${BASE_URL}chats/${waId}/`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const createChatTaggingCall = (waId, chatTaggingId, callback) => {
    axios.post(`${BASE_URL}chat_tagging/`, {
        chat: waId,
        tag: chatTaggingId
    }, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const deleteChatTaggingCall = (chatTaggingId, callback) => {
    axios.delete(`${BASE_URL}chat_tagging/${chatTaggingId}`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const listPersonsCall = (search, cancelToken, callback, errorCallback) => {
    axios.get(`${BASE_URL}persons/`, getConfig({
        search: search
    }, cancelToken))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
            errorCallback?.(error);
        });
}

export const retrieveChatAssignmentCall = (waId, callback) => {
    axios.get(`${BASE_URL}chat_assignment/${waId}/`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const updateChatAssignmentCall = (waId, assignedToUser, assignedGroup, callback) => {
    axios.put(`${BASE_URL}chat_assignment/${waId}/`, {
        'wa_id': waId,
        'assigned_to_user': assignedToUser,
        'assigned_group': assignedGroup,
    }, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const listGroupsCall = (callback) => {
    axios.get(`${BASE_URL}groups/`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const verifyContactsCall = (contacts, cancelToken, callback, errorCallback) => {
    axios.post(`${BASE_URL}contacts/verify/`, {
        blocking: "wait",
        contacts: contacts,
        force_check: true
    }, getConfig(undefined, cancelToken))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
            errorCallback?.(error);
        });
}

export const retrieveBusinessProfileCall = (cancelToken, callback) => {
    axios.get(`${BASE_URL}settings/business/profile/`, getConfig(undefined, cancelToken))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const updateBusinessProfileCall = (address, description, email, vertical, websites, cancelToken, callback,
                                          errorCallback) => {
    axios.patch(`${BASE_URL}settings/business/profile/`, {
        address: address,
        description: description,
        email: email,
        vertical: vertical,
        websites: Object.values(websites)
    }, getConfig(undefined, cancelToken))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
            errorCallback?.(error);
        });
}

export const retrieveProfileAboutCall = (cancelToken, callback) => {
    axios.get(`${BASE_URL}settings/profile/about/`, getConfig(undefined, cancelToken))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const updateProfileAboutCall = (about, cancelToken, callback, errorCallback) => {
    axios.patch( `${BASE_URL}settings/profile/about/`, {
        text: about
    }, getConfig(undefined, cancelToken))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
            errorCallback?.(error);
        });
}

export const retrieveProfilePhotoCall = (cancelToken, callback, errorCallback) => {
    axios.get(`${BASE_URL}settings/profile/photo/`,
        getConfig(undefined, cancelToken, 'arraybuffer'))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            errorCallback?.(error);
        });
}

export const updateProfilePhotoCall = (formData, cancelToken, callback, errorCallback) => {
    axios.post( `${BASE_URL}settings/profile/photo/`, formData, getConfig(undefined, cancelToken))
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
            errorCallback?.(error);
        });
}