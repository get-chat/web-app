import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../helpers/Helpers";
import {handleIfUnauthorized} from "../helpers/ApiHelper";

export const bulkSendCall = (body, callback) => {
    axios.post( `${BASE_URL}messages/`, body, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const listUsersCall = (limit, callback) => {
    axios.get( `${BASE_URL}users/`, getConfig({
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
    axios.get( `${BASE_URL}users/current/`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
            handleIfUnauthorized(error, history);
        });
}

export const listTemplatesCall = (callback) => {
    axios.get( `${BASE_URL}templates/`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const listSavedResponsesCall = (callback) => {
    axios.get( `${BASE_URL}saved_responses/`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const createSavedResponseCall = (text, callback) => {
    axios.post( `${BASE_URL}saved_responses/`, {
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
    axios.delete( `${BASE_URL}saved_responses/${id}/`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const resolveContactCall = (personWaId, callback) => {
    axios.get( `${BASE_URL}contacts/${personWaId}`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const listContactsCall = (search, limit, cancelToken, callback) => {
    axios.get( `${BASE_URL}contacts/`, getConfig({
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
    axios.get( `${BASE_URL}tags/`, getConfig())
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

export const listMessagesCall = (waId, offset, beforeTime, sinceTime, limit, cancelToken, callback, errorCallback) => {
    axios.get( `${BASE_URL}messages/`,
        getConfig({
            wa_id: waId,
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
    axios.post( `${BASE_URL}messages/`, body, getConfig())
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
    axios.post( `${BASE_URL}mark_as_received/`, {
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
    axios.get( `${BASE_URL}chats/${waId}/`, getConfig())
        .then((response) => {
            callback?.(response);
        })
        .catch((error) => {
            window.displayError(error);
        });
}

export const createChatTaggingCall = (waId, chatTaggingId, callback) => {
    axios.post( `${BASE_URL}chat_tagging/`, {
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
    axios.delete( `${BASE_URL}chat_tagging/${chatTaggingId}`, getConfig())
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