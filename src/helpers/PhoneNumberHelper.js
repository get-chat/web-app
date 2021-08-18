const removeWhitespaces = (text) => {
    return text.replace(/ /g, '');
}
const removeHyphens = (text) => {
    return text.replace(/-/g, '');
}
const removePluses = (text) => {
    return text.replace(/\+/g, '');
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