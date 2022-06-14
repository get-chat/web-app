import { replaceEmojis } from "./EmojiHelper";
import { getLastObject } from "./ObjectHelper";

import { sanitize } from "dompurify";

export function linkify(inputText) {
    let replacedText, replacePattern1, replacePattern2, replacePattern3;

    // URLs starting with http://, https://, or ftp://
    replacePattern1 =
        /(\b(https?|ftp):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gim;
    replacedText = inputText.replace(
        replacePattern1,
        '<a href="$1" target="_blank">$1</a>'
    );

    // URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(
        replacePattern2,
        '$1<a href="http://$2" target="_blank">$2</a>'
    );

    // Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-_.])+@[a-zA-Z_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(
        replacePattern3,
        '<a href="mailto:$1">$1</a>'
    );

    return replacedText;
}

export const formatMessage = (message) => {
    if (!message) return;

    let formatted = message.replaceAll("\n", "<br/>");
    formatted = linkify(formatted);
    formatted = sanitize(formatted);
    formatted = replaceEmojis(formatted);

    return formatted;
};
export const messageHelper = (messagesObject) => {
    const last = getLastObject(messagesObject);
    return extractTimestampFromMessage(last);
};
export const extractTimestampFromMessage = (message) => {
    return message ? parseInt(message.timestamp) : -1;
};
export const generateMessagePreview = (payload) => {
    const messageType = payload?.type;
    if (messageType === "text") {
        return payload?.text?.body ?? "";
    } else if (messageType === "template") {
        return "Template: " + (payload?.template?.name ?? "");
    } else {
        return messageType;
    }
};
