import { LocalStorage } from '../storage/LocalStorage';
import { MemoryStorage } from '../storage/MemoryStorage';

export const STORAGE_TAG_TOKEN = 'token';
const STORAGE_TAG_USER_PREFERENCES = 'user_preferences';
const STORAGE_TAG_DISPLAY_ASSIGNMENT_AND_TAGGING_HISTORY =
	'display_assignment_and_tagging_history';
const STORAGE_TAG_CONTACT_PROVIDERS_DATA = 'contact_providers_data';
const STORAGE_TAG_CONTACT_PROVIDERS_DATA_TIME = 'contact_providers_data_time';

const getLocalStorage = () => {
	try {
		return window.localStorage;
	} catch (e) {
		console.warn(e?.toString());
	}
};

export const initStorageType = () => {
	// @ts-ignore
	window.activeStorage = getLocalStorage()
		? new LocalStorage()
		: new MemoryStorage();
};

const getActiveStorage = () => {
	// @ts-ignore
	return window.activeStorage;
};

export const getStorage = () => {
	return getActiveStorage();
};

export const getToken = () => {
	return getStorage()?.getItem(STORAGE_TAG_TOKEN);
};

export const storeToken = (token: string) => {
	getStorage().setItem(STORAGE_TAG_TOKEN, token);
};

export const clearToken = () => {
	getStorage().removeItem(STORAGE_TAG_TOKEN);
};

export interface UserPreference {
	filters?: {
		filterTagId?: number;
		filterAssignedToMe?: boolean;
		filterAssignedGroupId?: number;
	};
}

interface UserPreferences {
	[userId: string]: UserPreference;
}

export const getUserPreferences = (): UserPreferences => {
	try {
		const data = getStorage()?.getItem(STORAGE_TAG_USER_PREFERENCES);
		return data ? JSON.parse(data) : {};
	} catch (e) {
		console.warn(e);
		return {};
	}
};

export const setUserPreference = (
	userId: number | undefined,
	userPreference: UserPreference
) => {
	if (!userId) return false;

	let userPreferences = getUserPreferences();
	userPreferences[userId] = userPreference;
	return getStorage()?.setItem(
		STORAGE_TAG_USER_PREFERENCES,
		JSON.stringify(userPreferences)
	);
};

export const getDisplayAssignmentAndTaggingHistory = () => {
	const result = getStorage().getItem(
		STORAGE_TAG_DISPLAY_ASSIGNMENT_AND_TAGGING_HISTORY
	);
	return result ? result === 'true' : true;
};

export const setDisplayAssignmentAndTaggingHistory = (willDisplay: boolean) => {
	return getStorage().setItem(
		STORAGE_TAG_DISPLAY_ASSIGNMENT_AND_TAGGING_HISTORY,
		willDisplay
	);
};

export const getContactProvidersData = () => {
	clearContactProvidersDataIfExpired();

	const data = getStorage().getItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA);
	return data ? JSON.parse(data) ?? {} : {};
};

export const storeContactProvidersData = (data: any) => {
	getStorage().setItem(
		STORAGE_TAG_CONTACT_PROVIDERS_DATA,
		JSON.stringify(data)
	);
};

export const clearContactProvidersData = () => {
	getStorage().removeItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA);
};

export const getContactProvidersDataTime = () => {
	const data = getStorage().getItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA_TIME);
	return data ? JSON.parse(data) : undefined;
};

export const storeContactProvidersDataTime = (time: any) => {
	getStorage().setItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA_TIME, time);
};

export const clearContactProvidersDataTime = () => {
	getStorage().removeItem(STORAGE_TAG_CONTACT_PROVIDERS_DATA_TIME);
};

const clearContactProvidersDataIfExpired = () => {
	const now = new Date().getTime();
	const storedAt = getContactProvidersDataTime();
	if (storedAt) {
		const hoursPast = Math.floor((now - storedAt) / 1000 / 60 / 60);
		if (hoursPast > 24) {
			clearContactProvidersDataTime();
			clearContactProvidersData();
		}
	} else {
		storeContactProvidersDataTime(now);
	}
};
