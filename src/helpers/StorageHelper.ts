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
// username used last (where a login lands). The tokens outlive a logout: for
// an account that logs in with 360dialog only, the token an accepted invite
// gave may be the only way back into that inbox.
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

// Per username, then per inbox: two accounts on one browser can be members of
// the same inbox, and neither may overwrite or drop the other's token
type TenantTokens = { [username: string]: { [tenantId: string]: string } };

const getTenantTokens = (): TenantTokens => {
	try {
		const data = JSON.parse(
			getStorage()?.getItem(STORAGE_TAG_TENANT_TOKENS) ?? '{}'
		);
		// Skips the flat { tenantId: token } of the first builds
		return Object.fromEntries(
			Object.entries(data ?? {}).filter(
				([, tokens]) => tokens && typeof tokens === 'object'
			)
		) as TenantTokens;
	} catch (e) {
		console.warn(e);
		return {};
	}
};

const storeTenantTokens = (tokens: TenantTokens) =>
	getStorage()?.setItem(STORAGE_TAG_TENANT_TOKENS, JSON.stringify(tokens));

export const getTenantToken = (
	username: string,
	tenantId: string
): string | undefined => getTenantTokens()[username]?.[tenantId];

// Replaces the token saved before for this account and inbox, e.g. one that an
// invite back into the inbox (after access was switched off) has invalidated
export const storeTenantToken = (
	username: string,
	tenantId: string,
	token: string
) => {
	// No account to keep it for (no current user yet)
	if (!username) return;
	const tokens = getTenantTokens();
	tokens[username] = { ...tokens[username], [tenantId]: token };
	storeTenantTokens(tokens);
};

// Only for a token the backend rejected (401/403, or another account's),
// wherever it is saved
export const removeTenantToken = (token: string) => {
	const tokens = getTenantTokens();
	Object.values(tokens).forEach((byTenant) =>
		Object.keys(byTenant).forEach((tenantId) => {
			if (byTenant[tenantId] === token) delete byTenant[tenantId];
		})
	);
	storeTenantTokens(tokens);
};

// Switching to another API host (the legacy switcher): these tokens are the
// other host's
export const clearTenantTokens = () =>
	getStorage()?.removeItem(STORAGE_TAG_TENANT_TOKENS);

// Every inbox a token was saved for, of any account
const getTenantIdsWithTokens = () =>
	Object.values(getTenantTokens()).flatMap((byTenant) => Object.keys(byTenant));

// Logout: which inbox the app is in. The inboxes' tokens and the inbox each
// username used last stay.
export const clearCurrentTenant = () => {
	getStorage()?.removeItem(STORAGE_TAG_CURRENT_TENANT);
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
		...getTenantIdsWithTokens(),
		getCurrentTenantId(),
	]);
	getStorage()?.removeItem(STORAGE_TAG_MESSAGE_DRAFTS);
	tenantIds.forEach(
		(tenantId) =>
			tenantId && getStorage()?.removeItem(getMessageDraftsTag(tenantId))
	);
};
