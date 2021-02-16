import {Emoji, getEmojiDataFromNative} from "emoji-mart";
import data from 'emoji-mart/data/all.json'
import {EMOJI_SET, EMOJI_SHEET_SIZE} from "./Constants";
const { htmlToText } = require('html-to-text');

const getToken = () => {
    return localStorage.getItem("token");
}

const getConfig = (params, cancelToken) => {
    return {
        params,
        headers: {
            'Authorization': 'Token ' + getToken(),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        cancelToken: cancelToken
    }
}

const STORAGE_TAG_TOKEN = "token";

const setToken = (token) => {
    localStorage.setItem(STORAGE_TAG_TOKEN, token);
}

const clearToken = () => {
    localStorage.removeItem(STORAGE_TAG_TOKEN);
}

const getObjLength = (obj) => {
    return Object.keys(obj).length;
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

const formatMessage = (message) => {
    if (!message) return;

    let formatted = message.replaceAll('\n', '<br/>');
    formatted = linkify(formatted);
    return replaceEmojis(formatted);
}

const replaceEmojis = (message) => {
    const reg = new RegExp('(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])', 'g');
    return message.replace(reg, function (occurrence) {
        const emojiData = getEmojiDataFromNative(occurrence, EMOJI_SET, data);
        return Emoji({
            html: true,
            emoji: emojiData,
            size: 22,
            set: EMOJI_SET,
            sheetSize: EMOJI_SHEET_SIZE
        })
    });
}

const translateHTMLInputToText = (html) => {
    let result;
    const reg = new RegExp('((<span\\b[^>]*\\s\\bstyle=(["\'])([^"]*)\\3[^>]*>)(.*?)</span>)', 'g');
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

const markOccurrences = (message, sub) => {
    if (!message) return;

    const reg = new RegExp('(' + sub + ')', 'gi');
    return message.replace(reg, '<span class="searchOccurrence">$1</span>');
}

const getFirstMessage = (messagesObject) => {
    return messagesObject[Object.keys(messagesObject)[0]];
}

const getLastMessage = (messagesObject) => {
    return messagesObject[Object.keys(messagesObject)[Object.keys(messagesObject).length - 1]];
}

const getLastMessageAndExtractTimestamp = (messagesObject) => {
    const last = getLastMessage(messagesObject);
    return last ? parseInt(last.timestamp) : -1;
}

export {
    getToken,
    getConfig,
    setToken,
    clearToken,
    formatMessage,
    translateHTMLInputToText,
    markOccurrences,
    getFirstMessage,
    getLastMessage,
    getLastMessageAndExtractTimestamp,
    getObjLength
};