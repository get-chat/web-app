const STORAGE_TAG_TOKEN = "token";
const STORAGE_TAG_DISPLAY_ASSIGNMENT_AND_TAGGING_HISTORY = "display_assignment_and_tagging_history";
const STORAGE_TAG_CONTACT_PROVIDERS_DATA = "contact_providers_data";
const STORAGE_TAG_CONTACT_PROVIDERS_DATA_TIME = "contact_providers_data_time";

export const getToken = () => {
    return localStorage.getItem(STORAGE_TAG_TOKEN);
}

export const storeToken = (token) => {
    localStorage.setItem(STORAGE_TAG_TOKEN, token);
}

export const clearToken = () => {
    localStorage.removeItem(STORAGE_TAG_TOKEN);
}

export const getDisplayAssignmentAndTaggingHistory = () => {
    const result = localStorage.getItem(STORAGE_TAG_DISPLAY_ASSIGNMENT_AND_TAGGING_HISTORY);
    return result ? result === 'true' : true;
}

export const setDisplayAssignmentAndTaggingHistory = (willDisplay) => {
    console.log(willDisplay);
    return localStorage.setItem(STORAGE_TAG_DISPLAY_ASSIGNMENT_AND_TAGGING_HISTORY, willDisplay);
}

export const getContactProvidersData = () => {
    clearContactProvidersDataIfExpired();

    return JSON.parse(localStorage.getItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA)) ?? {};
}

export const storeContactProvidersData = (data) => {
    localStorage.setItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA, JSON.stringify(data));
}

export const clearContactProvidersData = () => {
    localStorage.removeItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA);
}

export const getContactProvidersDataTime = () => {
    return JSON.parse(localStorage.getItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA_TIME));
}

export const storeContactProvidersDataTime = (time) => {
    localStorage.setItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA_TIME, time);
}

export const clearContactProvidersDataTime = () => {
    localStorage.removeItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA_TIME);
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