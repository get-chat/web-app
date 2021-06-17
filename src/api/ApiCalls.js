import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../helpers/Helpers";

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