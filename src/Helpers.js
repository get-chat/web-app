import {Emoji, getEmojiDataFromNative} from "emoji-mart";
import data from './EmojiData.json'; //from 'emoji-mart/data/all.json'
import {
    ATTACHMENT_TYPE_AUDIO, ATTACHMENT_TYPE_DOCUMENT,
    ATTACHMENT_TYPE_IMAGE,
    ATTACHMENT_TYPE_VIDEO,
    EMOJI_SET,
    EMOJI_SHEET_SIZE
} from "./Constants";
const { htmlToText } = require('html-to-text');
const emojiRegex = require('emoji-regex/RGI_Emoji.js');

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

function containsOnlyEmojis(text) {
    const onlyEmojis = text.replace(new RegExp('[\u0000-\u1eeff]', 'g'), '')
    const visibleChars = text.replace(new RegExp('[\n\r\s]+|( )+', 'g'), '')
    return onlyEmojis.length === visibleChars.length
}

const replaceEmojis = (message) => {
    const onlyEmojis = containsOnlyEmojis(message);
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

const translateHTMLInputToText = (html) => {
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

const getAttachmentTypeByMimeType = (mimeType) => {
    let attachmentType;
    if (mimeType.includes('image')) {
        attachmentType = ATTACHMENT_TYPE_IMAGE;
    } else if (mimeType.includes('video')) {
        attachmentType = ATTACHMENT_TYPE_VIDEO;
    } else if (mimeType.includes('audio')) {
        attachmentType = ATTACHMENT_TYPE_AUDIO;
    } else {
        attachmentType = ATTACHMENT_TYPE_DOCUMENT;
    }

    return attachmentType;
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
    getObjLength,
    getAttachmentTypeByMimeType
};