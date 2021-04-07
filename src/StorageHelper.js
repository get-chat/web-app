const STORAGE_TAG_TOKEN = "token";
export const getToken = () => {
    return localStorage.getItem(STORAGE_TAG_TOKEN);
}
export const storeToken = (token) => {
    localStorage.setItem(STORAGE_TAG_TOKEN, token);
}
export const clearToken = () => {
    localStorage.removeItem(STORAGE_TAG_TOKEN);
}
const STORAGE_TAG_CONTACT_PROVIDERS_DATA = "contact_providers_data"
export const getContactProvidersData = () => {
    return JSON.parse(localStorage.getItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA)) ?? {};
}
export const storeContactProvidersData = (data) => {
    localStorage.setItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA, JSON.stringify(data));
}
export const clearContactProvidersData = () => {
    localStorage.removeItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA);
}