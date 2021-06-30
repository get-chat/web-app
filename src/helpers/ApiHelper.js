import {clearContactProvidersData, clearToken} from "./StorageHelper";

export const handleIfUnauthorized = (error, history) => {
    if (error?.response?.status === 401) {
        clearUserSession("invalidToken", history);
    }
}

export const clearUserSession = (errorCase, nextLocation, history) => {
    clearToken();
    clearContactProvidersData();

    let path;

    if (errorCase) {
        path = `/login/error/${errorCase}`;
    } else {
        path = "/";
    }

    history.push({
        'pathname': path,
        'nextPath': nextLocation?.pathname,
        'search': nextLocation?.search
    });
}