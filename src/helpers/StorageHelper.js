import {LocalStorage} from "../storage/LocalStorage";
import {MemoryStorage} from "../storage/MemoryStorage";

const STORAGE_TAG_TOKEN = "token";
const STORAGE_TAG_DISPLAY_ASSIGNMENT_AND_TAGGING_HISTORY = "display_assignment_and_tagging_history";
const STORAGE_TAG_CONTACT_PROVIDERS_DATA = "contact_providers_data";
const STORAGE_TAG_CONTACT_PROVIDERS_DATA_TIME = "contact_providers_data_time";

const getLocalStorage = () => {
    try {
        return window.localStorage;
    } catch (e) {
        console.warn(e.toString());
    }
}

export const initStorageType = () => {
    window.activeStorage = getLocalStorage() ? new LocalStorage() : new MemoryStorage();
}

const getActiveStorage = () => {
    return window.activeStorage;
}

export const getToken = () => {
    return getActiveStorage().getItem(STORAGE_TAG_TOKEN);
}

export const storeToken = (token) => {
    getActiveStorage().setItem(STORAGE_TAG_TOKEN, token);
}

export const clearToken = () => {
    getActiveStorage().removeItem(STORAGE_TAG_TOKEN);
}

export const getDisplayAssignmentAndTaggingHistory = () => {
    const result = getActiveStorage().getItem(STORAGE_TAG_DISPLAY_ASSIGNMENT_AND_TAGGING_HISTORY);
    return result ? result === 'true' : true;
}

export const setDisplayAssignmentAndTaggingHistory = (willDisplay) => {
    return getActiveStorage().setItem(STORAGE_TAG_DISPLAY_ASSIGNMENT_AND_TAGGING_HISTORY, willDisplay);
}

export const getContactProvidersData = () => {
    clearContactProvidersDataIfExpired();

    const data = getActiveStorage().getItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA);
    return data ? JSON.parse(data) ?? {} : {};
}

export const storeContactProvidersData = (data) => {
    getActiveStorage().setItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA, JSON.stringify(data));
}

export const clearContactProvidersData = () => {
    getActiveStorage().removeItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA);
}

export const getContactProvidersDataTime = () => {
    const data = getActiveStorage().getItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA_TIME);
    return data ? JSON.parse(data) : undefined;
}

export const storeContactProvidersDataTime = (time) => {
    getActiveStorage().setItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA_TIME, time);
}

export const clearContactProvidersDataTime = () => {
    getActiveStorage().removeItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA_TIME);
}

const clearContactProvidersDataIfExpired = () => {
    const now = (new Date()).getTime();
    const storedAt = getContactProvidersDataTime();
    if (storedAt) {
        const hoursPast = Math.floor((now - storedAt) / 1000 / 60 / 60);
        if (hoursPast > 24) {
            clearContactProvidersDataTime();
            clearContactProvidersData();
        }
    } else {
        storeContactProvidersDataTime(now);
    }
}