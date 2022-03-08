import axios from "axios";
import PubSub from "pubsub-js";
import { EVENT_TOPIC_FORCE_LOGOUT } from "../Constants";
import { getConfig } from "../helpers/ApiHelper";
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

}