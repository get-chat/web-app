const getToken = () => {
    return localStorage.getItem("token");
}

const getConfig = (params) => {
    return {
        params,
        headers: {
            'Authorization': 'Token ' + getToken(),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
}

const STORAGE_TAG_TOKEN = "token";

const setToken = (token) => {
    localStorage.setItem(STORAGE_TAG_TOKEN, token);
}

const clearToken = () => {
    localStorage.removeItem(STORAGE_TAG_TOKEN);
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
    let formatted = message.replaceAll('\n', '<br/>');
    return linkify(formatted);
}

export {getToken, getConfig, setToken, clearToken, formatMessage};