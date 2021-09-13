import {BASE_URL} from "../Constants";

export const isLocalHost = () => {
    return (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
}

export const getAdminPanelURL = () => {
    return BASE_URL.replace('/api/v1', '/admin');
}
export const getHubURL = () => {
    return BASE_URL.replace('/api/v1', '/hub');
}
export const getBaseURL = () => {
    const windowLocation = window.location;
    return windowLocation.protocol + "//" + windowLocation.host + "/";
}
export const getWebSocketURL = () => {
    let baseUrlEnv = BASE_URL;
    if (!baseUrlEnv || baseUrlEnv === "/" || baseUrlEnv === "/api/v1/" || baseUrlEnv === "/api/v2/") {
        const baseURL = getBaseURL();
        return prepareWebsocketURL(baseURL);
    } else {
        return prepareWebsocketURL(baseUrlEnv);
    }
}
const prepareWebsocketURL = (url) => {
    return url
        .replace('https://', 'wss://websockets-')
        .replace('http://', 'wss://websockets-')
        .replace('api/v1/', '')
        .replace('api/v2/', '');
}