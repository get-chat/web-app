import { LocalStorage } from '../storage/LocalStorage';
import { MemoryStorage } from '../storage/MemoryStorage';
import { UserPreference } from '@src/interfaces/UserPreference';
import { UserPreferences } from '@src/interfaces/UserPreferences';
import { getObjLength } from '@src/helpers/ObjectHelper';
import { AppConfig } from '@src/config/application';

export const STORAGE_TAG_TOKEN = 'token';
const STORAGE_TAG_USER_PREFERENCES = 'user_preferences';
const STORAGE_TAG_DISPLAY_ASSIGNMENT_AND_TAGGING_HISTORY =
	'display_assignment_and_tagging_history';
const STORAGE_TAG_CONTACT_PROVIDERS_DATA = 'contact_providers_data';
const STORAGE_TAG_CONTACT_PROVIDERS_DATA_TIME = 'contact_providers_data_time';
const STORAGE_TAG_CURRENT_API_BASE_URL = 'current_api_base_url';
const STORAGE_TAG_API_BASE_URLS = 'api_base_urls';
const STORAGE_TAG_MESSAGE_DRAFTS = 'message_drafts';
// Multi-tenant inboxes (MT 3.6): the inbox the stored token belongs to, the
// tokens of the account's inboxes this device has opened, and the inbox each
// username used last (where a login lands)
const STORAGE_TAG_CURRENT_TENANT = 'current_tenant';
const STORAGE_TAG_TENANT_TOKENS = 'tenant_tokens';
const STORAGE_TAG_LAST_TENANTS = 'last_tenants';

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

function isQuotaExceededError(err: unknown): boolean {
	return (
		err instanceof DOMException &&
		// everything except Firefox
		(err.code === 22 ||
			// Firefox
			err.code === 1014 ||
			// test name field too, because code might not be present
			// everything except Firefox
			err.name === 'QuotaExceededError' ||
			// Firefox
			err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
	);
}

export const getToken = () => {
	return getStorage()?.getItem(STORAGE_TAG_TOKEN);
};

export const storeToken = (token: string) => {
	getStorage().setItem(STORAGE_TAG_TOKEN, token);
};

export const clearToken = () => {
	getStorage().removeItem(STORAGE_TAG_TOKEN);
};

const getJSONObject = (tag: string): { [key: string]: string } => {
	try {
		const data = getStorage()?.getItem(tag);
		return data ? JSON.parse(data) ?? {} : {};
	} catch (e) {
		console.warn(e);
		return {};
	}
};

export const getCurrentTenantId = (): string | undefined =>
	getStorage()?.getItem(STORAGE_TAG_CURRENT_TENANT) ?? undefined;

export const storeCurrentTenantId = (tenantId: string) => {
	// Drafts are kept per inbox. The first inbox known on this device adopts
	// the drafts written before inboxes were told apart.
	if (!getCurrentTenantId()) {
		const legacyDrafts = getStorage()?.getItem(STORAGE_TAG_MESSAGE_DRAFTS);
		const draftsTag = getMessageDraftsTag(tenantId);
		if (legacyDrafts && !getStorage()?.getItem(draftsTag)) {
			getStorage()?.setItem(draftsTag, legacyDrafts);
		}
		getStorage()?.removeItem(STORAGE_TAG_MESSAGE_DRAFTS);
	}
	getStorage()?.setItem(STORAGE_TAG_CURRENT_TENANT, tenantId);
};

export const getTenantToken = (tenantId: string): string | undefined =>
	getJSONObject(STORAGE_TAG_TENANT_TOKENS)[tenantId];

export const storeTenantToken = (tenantId: string, token: string) => {
	const tokens = getJSONObject(STORAGE_TAG_TENANT_TOKENS);
	tokens[tenantId] = token;
	getStorage()?.setItem(STORAGE_TAG_TENANT_TOKENS, JSON.stringify(tokens));
};

export const removeTenantToken = (tenantId: string) => {
	const tokens = getJSONObject(STORAGE_TAG_TENANT_TOKENS);
	delete tokens[tenantId];
	getStorage()?.setItem(STORAGE_TAG_TENANT_TOKENS, JSON.stringify(tokens));
};

// Logout: the tokens go, the inbox each username used last stays
export const clearTenantSession = () => {
	getStorage()?.removeItem(STORAGE_TAG_CURRENT_TENANT);
	getStorage()?.removeItem(STORAGE_TAG_TENANT_TOKENS);
};

export const getLastTenantId = (username: string): string | undefined =>
	getJSONObject(STORAGE_TAG_LAST_TENANTS)[username];

export const storeLastTenantId = (username: string, tenantId: string) => {
	const lastTenants = getJSONObject(STORAGE_TAG_LAST_TENANTS);
	lastTenants[username] = tenantId;
	getStorage()?.setItem(STORAGE_TAG_LAST_TENANTS, JSON.stringify(lastTenants));
};

export const getApiBaseURLs = (): string[] => {
	try {
		const data = getStorage()?.getItem(STORAGE_TAG_API_BASE_URLS);
		return data ? JSON.parse(data) : [];
	} catch (e) {
		console.warn(e);
		return [];
	}
};

export const getApiBaseURLsMergedWithConfig = (config: AppConfig | null) => {
	const urls = getApiBaseURLs();
	if (config && !urls.includes(config.API_BASE_URL)) {
		urls.push(config.API_BASE_URL);
	}
	return urls;
};

export const storeApiBaseURLs = (urls: string[]) =>
	getStorage()?.setItem(STORAGE_TAG_API_BASE_URLS, JSON.stringify(urls));

export const getCurrentApiBaseURL = (): string | null | undefined =>
	getStorage()?.getItem(STORAGE_TAG_CURRENT_API_BASE_URL);

export const storeCurrentApiBaseURL = (url?: string) =>
	getStorage()?.setItem(STORAGE_TAG_CURRENT_API_BASE_URL, url);

export const getUserPreferences = (): UserPreferences => {
	try {
		const data = getStorage()?.getItem(STORAGE_TAG_USER_PREFERENCES);
		return data ? JSON.parse(data) : {};
	} catch (e) {
		console.warn(e);
		return {};
	}
};

export const storeUserPreference = (
	userId: number | undefined,
	userPreference: UserPreference
) => {
	console.log('Storing user preferences...');

	if (!userId) return false;

	let userPreferences = getUserPreferences();

	// Prevent overgrowing
	try {
		if (getObjLength(userPreferences) >= 20) {
			const oldestKey = Object.entries(userPreferences).reduce((prev, next) =>
				(prev[1].updatedAt ?? 0) > (next[1].updatedAt ?? 0) ? next : prev
			)[0];
			delete userPreferences[oldestKey];
		}
	} catch (e) {
		console.warn(e);
		userPreferences = {};
	}

	// Add update date
	userPreference.updatedAt = new Date().getTime();

	// Add current user preferences
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
	try {
		getStorage().setItem(
			STORAGE_TAG_CONTACT_PROVIDERS_DATA,
			JSON.stringify(data)
		);
	} catch (e) {
		if (isQuotaExceededError(e)) {
			clearContactProvidersData();
		}
	}
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

// Message Drafts Storage
interface MessageDrafts {
	[waId: string]: string;
}

// One set of drafts per inbox: the same contact can be in two of them
const getMessageDraftsTag = (tenantId = getCurrentTenantId()) =>
	tenantId
		? `${STORAGE_TAG_MESSAGE_DRAFTS}:${tenantId}`
		: STORAGE_TAG_MESSAGE_DRAFTS;

export const getMessageDrafts = (): MessageDrafts => {
	try {
		const data = getStorage()?.getItem(getMessageDraftsTag());
		return data ? JSON.parse(data) : {};
	} catch (e) {
		console.warn(e);
		return {};
	}
};

export const getMessageDraft = (waId: string): string | undefined => {
	const drafts = getMessageDrafts();
	return drafts[waId];
};

export const storeMessageDraft = (waId: string, draft: string) => {
	try {
		const drafts = getMessageDrafts();
		if (draft && draft.trim().length > 0) {
			drafts[waId] = draft;
		} else {
			// Remove empty drafts
			delete drafts[waId];
		}
		getStorage()?.setItem(getMessageDraftsTag(), JSON.stringify(drafts));
	} catch (e) {
		if (isQuotaExceededError(e)) {
			console.warn(
				'Storage quota exceeded when saving draft, clearing old drafts'
			);
			clearMessageDrafts();
		}
	}
};

export const removeMessageDraft = (waId: string) => {
	try {
		const drafts = getMessageDrafts();
		delete drafts[waId];
		getStorage()?.setItem(getMessageDraftsTag(), JSON.stringify(drafts));
	} catch (e) {
		console.warn(e);
	}
};

// The drafts of every inbox this device has opened
export const clearMessageDrafts = () => {
	const tenantIds = new Set([
		...Object.keys(getJSONObject(STORAGE_TAG_TENANT_TOKENS)),
		getCurrentTenantId(),
	]);
	getStorage()?.removeItem(STORAGE_TAG_MESSAGE_DRAFTS);
	tenantIds.forEach(
		(tenantId) =>
			tenantId && getStorage()?.removeItem(getMessageDraftsTag(tenantId))
	);
};
