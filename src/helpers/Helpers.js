import {BASE_URL} from "../Constants";
import {getToken} from "./StorageHelper";
import dompurify from "dompurify";
import {getObjLength} from "./ObjectHelper";

const { htmlToText } = require('html-to-text');

export const getConfig = (params, cancelToken, responseType) => {
    const config = {
        withCredentials: false,
        params,
        headers: {
            'Authorization': 'Token ' + getToken(),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        cancelToken: cancelToken
    }

    if (responseType !== undefined) {
        config.responseType = responseType;
    }

    return config;
}

export const translateHTMLInputToText = (html) => {
    let result;
    //const reg = new RegExp('((<span\\b[^>]*\\s\\bstyle=(["\'])([^"]*)\\3[^>]*>)(.*?)</span>)', 'g');
    const reg = new RegExp('<img\\s[^>]*?src\\s*=\\s*[\'\\"]([^\'\\"]*?)[\'\\"][^>]*?>', 'g');
    result = html.replace(reg, function (occurrences) {
        // Extract unicode from aria-label
        const matches = occurrences.match(new RegExp('aria-label="\\s*(.*?)\\s*,'), '$1');
        if (matches && matches.length >= 1) {
            return matches[1];
        }
        return '';
    });

    // Convert it to plain text
    result = htmlToText(result);

    return result;
}

export const markOccurrences = (message, sub) => {
    if (!message) return;

    const reg = new RegExp('(' + sub + ')', 'gi');
    return message.replace(reg, '<span class="searchOccurrence">$1</span>');
}

export const generateInitialsHelper = (name) => {
    return (name ? name.replace(/[^a-z\d\s]+/gi, '').trim()[0] : '')?.toUpperCase();
}

export const generateUnixTimestamp = () => {
    return Math.round(+new Date() / 1000);
}

export const stringContainsAnyInArray = (string, array) => {
    for (let i = 0; i < array.length; i++) {
        if (string.includes(array[i])) {
            return true;
        }
    }

    return false;
}

export const getSelectionHtml = () => {
    let html = "";
    if (typeof window.getSelection != "undefined") {
        const sel = window.getSelection();
        if (sel.rangeCount) {
            const container = document.createElement("div");
            for (let i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type === "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
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
        return prepareWebsocketUrl(baseURL);
    } else {
        return prepareWebsocketUrl(baseUrlEnv);
    }
}

const prepareWebsocketUrl = (url) => {
    return url
        .replace('https://', 'wss://websockets-')
        .replace('http://', 'wss://websockets-')
        .replace('api/v1/', '')
        .replace('api/v2/', '');
}

export const displaySeconds = (seconds) => {
    const format = val => `0${Math.floor(val)}`.slice(-2);
    //const hours = seconds / 3600;
    const minutes = (seconds % 3600) / 60;

    return [minutes, seconds % 60].map(format).join(':');
}

const removeWhitespaces = (text) => {
    return text.replace(/ /g,'');
}

const removeHyphens = (text) => {
    return text.replace(/-/g, '');
}

const removePluses = (text) => {
    return text.replace(/\+/g,'');
}

export const preparePhoneNumber = (phoneNumber) => {
    phoneNumber = removeHyphens(phoneNumber);
    phoneNumber = removeWhitespaces(phoneNumber);
    phoneNumber = removePluses(phoneNumber);

    return phoneNumber;
}

export const addPlus = (phoneNumber) => {
    return phoneNumber?.includes('+') ? phoneNumber : `+${phoneNumber}`;
}

export const containsLetters = (text) => {
    const regExp = /[a-zA-Z]/g;
    return regExp.test(text);
}

export const extractAvatarFromContactProviderData = (contactProviderData, isLarge) => {
    if (contactProviderData) {
        for (let i = 0; i < getObjLength(contactProviderData); i++) {
            const data = contactProviderData[i];
            if (data?.avatar) {
                return isLarge === true && data?.large_avatar ? data.large_avatar : data.avatar;
            }
        }
    }

    return undefined;
}

export const hasInternetConnection = () => {
    return navigator.onLine;
}

export const sortMessagesAsc = (messages) => {
    let sortedNextState = Object.entries(messages)
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
    return Object.fromEntries(sortedNextState);
}

export const isScrollable = (el) => {
    const hasScrollableContent = el.scrollHeight > el.clientHeight;
    const overflowYStyle = window.getComputedStyle(el).overflowY;
    const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

    return hasScrollableContent && !isOverflowHidden;
}

export const sanitize = (dirty) => {
    if (!dirty) return;
    const sanitizer = dompurify.sanitize;
    return sanitizer(dirty);
}