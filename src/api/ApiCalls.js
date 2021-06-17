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

export const listContactsCall = (limit, callback) => {
    axios.get( `${BASE_URL}contacts/`, getConfig({
        limit: limit
    }))
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