import {Emoji, getEmojiDataFromNative} from "emoji-mart";
import data from './EmojiData.json'; //from 'emoji-mart/data/all.json'
import {EMOJI_SET, EMOJI_SHEET_SIZE} from "./Constants";

const { htmlToText } = require('html-to-text');
const emojiRegex = require('emoji-regex/RGI_Emoji.js');

export const getToken = () => {
    return localStorage.getItem("token");
}

export const getConfig = (params, cancelToken, responseType) => {
    const config = {
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

const STORAGE_TAG_TOKEN = "token";

export const setToken = (token) => {
    localStorage.setItem(STORAGE_TAG_TOKEN, token);
}

export const clearToken = () => {
    localStorage.removeItem(STORAGE_TAG_TOKEN);
}

export const getObjLength = (obj) => {
    return obj ? Object.keys(obj).length : 0;
}

function linkify(inputText) {
    let replacedText, replacePattern1, replacePattern2, replacePattern3;

    // URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    // URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    // Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-_.])+@[a-zA-Z_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}

export const formatMessage = (message) => {
    if (!message) return;

    let formatted = message.replaceAll('\n', '<br/>');
    formatted = linkify(formatted);
    return replaceEmojis(formatted);
}

function containsOnlyEmojis(text) {
    const onlyEmojis = text.replace(new RegExp('[\u0000-\u1eeff]', 'g'), '')
    const visibleChars = text.replace(new RegExp('[\n\r\s]+|( )+', 'g'), '')
    return onlyEmojis.length === visibleChars.length
}

export const replaceEmojis = (message, ignoreOnlyEmojis) => {
    if (!message) return;

    const onlyEmojis = !ignoreOnlyEmojis ? containsOnlyEmojis(message) : false;
    const regex = emojiRegex();

    return message.replace(regex, function (occurrence) {
        // TODO: Finding emoji data is too slow, find an alternative or improve it
        const emojiData = getEmojiDataFromNative(occurrence, EMOJI_SET, data);
        if (emojiData) {
            return Emoji({
                html: true,
                emoji: emojiData,
                size: onlyEmojis ? 44 : 22,
                set: EMOJI_SET,
                sheetSize: EMOJI_SHEET_SIZE
            })
        } else {
            return occurrence;
        }
    });
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

export const getFirstObject = (jsonObject) => {
    return jsonObject[Object.keys(jsonObject)[0]];
}

export const getLastObject = (jsonObject) => {
    return jsonObject[Object.keys(jsonObject)[Object.keys(jsonObject).length - 1]];
}

export const getObjectByIndex = (jsonObject, index) => {
    return jsonObject[Object.keys(jsonObject)[index]];
}

export const getLastKey = (jsonObject) => {
    const keys = Object.keys(jsonObject);
    return keys[keys.length - 1];
}

export const getLastMessageAndExtractTimestamp = (messagesObject) => {
    const last = getLastObject(messagesObject);
    return extractTimestampFromMessage(last);
}

export const extractTimestampFromMessage = (message) => {
    return message ? parseInt(message.timestamp) : -1;
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

export const getBaseURL = () => {
    const windowLocation = window.location;
    return windowLocation.protocol + "//" + windowLocation.host + "/";
}

export const getWebSocketURL = () => {
    const baseURL = getBaseURL();
    if (baseURL.includes('localhost')) {
        return 'wss://websockets.whatsapp.kondz.io/';
    } else {
        return baseURL.replace('https://', 'wss://websockets.').replace('http://', 'wss://websockets.');
    }
}

export const displaySeconds = (seconds) => {
    const format = val => `0${Math.floor(val)}`.slice(-2);
    //const hours = seconds / 3600;
    const minutes = (seconds % 3600) / 60;

    return [minutes, seconds % 60].map(format).join(':');
}

export const getTemplateParams = (text) => {
    const matches = text?.match(/\{{(.*?)\}}/g);
    return matches ? matches : [];
}

export const templateParamToInteger = (templateParam) => {
    return templateParam.match(/\d+/);
}

export const insertTemplateBodyParameters = (componentType, text, params) => {
    if (!text) return;

    if (!params) return text;

    for (let i = 0; i < params.length; i++) {
        const component = params[i];

        if (component.type === componentType.toLowerCase()) {
            component.parameters.forEach((param, index) => {
                text = text.replace(`{{${index+1}}}`, param.text);
            });

            break;
        }
    }

    return text;
}

export const getTemplateHeaderImageByParams = (params) => {
    if (!params) return;

    for (let i = 0; i < params.length; i++) {
        const component = params[i];

        if (component.type === "header") {
            return component['parameters']?.[0]?.image?.link;
        }
    }
}