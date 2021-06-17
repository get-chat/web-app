import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../helpers/Helpers";
import {handleIfUnauthorized} from "../helpers/ApiHelper";
import TemplateMessageClass from "../TemplateMessageClass";
import SavedResponseClass from "../SavedResponseClass";

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