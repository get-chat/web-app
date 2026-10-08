import { AxiosError } from 'axios';
import { fetchSessionToken } from '@src/api/authApi';
import { fetchTenants, switchSessionTenant } from '@src/api/tenantsApi';
import { fetchCurrentUser, updateUserAvailability } from '@src/api/usersApi';
import { fetchWhatsAppAccounts } from '@src/api/whatsAppAccountsApi';
import { fetchUserAvailabilitySettings } from '@src/api/settingsApi';
import {
	getCurrentTenantId,
	getTenantToken,
	removeTenantToken,
	storeCurrentTenantId,
	storeTenantToken,
} from '@src/helpers/StorageHelper';
import { Tenant } from '@src/types/tenants';

/*
 * Multi-tenant inboxes (MT 3.6, backend inbox#1154). One account can be a
 * member of several inboxes, and an auth token belongs to one of them. The
 * backend gives no token for another inbox in exchange for a token (decision
 * D11: a leaked token must not open every inbox), so the app gets one with:
 *   1. the token this device stored when it opened that inbox before;
 *   2. the backend session, if this browser has one of the same account (a
 *      "Login with 360dialog" or admin panel login): it is switched to the
 *      inbox and gives its token;
 *   3. otherwise the password, once per inbox and device.
 */

const getUsername = async (token: string) => {
	try {
		const user = await fetchCurrentUser({
			headers: { Authorization: `Token ${token}` },
		});
		return user.username;
	} catch (error: any | AxiosError) {
		return undefined;
	}
};

const getSessionToken = async () => {
	try {
		return (await fetchSessionToken()).token;
	} catch (error) {
		return undefined;
	}
};

// Step 2: only a session of the same account may be used, it could be a
// colleague's admin panel login on a shared machine
const getTokenFromSession = async (tenantId: string, username: string) => {
	const sessionToken = await getSessionToken();
	if (!sessionToken || (await getUsername(sessionToken)) !== username) {
		return undefined;
	}
	try {
		await switchSessionTenant(tenantId);
	} catch (error) {
		// A 360dialog login may enter only the inboxes it was authorized for
		return undefined;
	}
	return getSessionToken();
};

// A token for the inbox without asking for the password, if there is a way
export const getTokenWithoutPassword = async (
	tenantId: string,
	username: string
) => {
	const storedToken = getTenantToken(tenantId);
	if (storedToken) {
		if ((await getUsername(storedToken)) === username) {
			return storedToken;
		}
		// Revoked, or the membership was switched off
		removeTenantToken(tenantId);
	}
	return getTokenFromSession(tenantId, username);
};

// The current inbox among the account's. Tokens from logins that named no
// inbox (an account in one inbox, 360dialog login, refresh tokens) do not say
// which inbox they belong to: the inbox's WhatsApp number tells.
const findCurrentTenant = async (tenants: Tenant[]) => {
	const storedId = getCurrentTenantId();
	const stored = tenants.find((tenant) => tenant.id === storedId);
	if (stored || tenants.length <= 1) {
		return stored ?? tenants[0];
	}
	try {
		const data = await fetchWhatsAppAccounts(true);
		const phoneNumber = data.results?.[0]?.phone_number;
		return phoneNumber
			? tenants.find((tenant) => tenant.phone_number === phoneNumber)
			: undefined;
	} catch (error) {
		console.error(error);
		return undefined;
	}
};

// The account's inboxes and which one this is, remembering the token as that
// inbox's
export const loadTenants = async (token: string) => {
	const { tenants } = await fetchTenants();
	const current = await findCurrentTenant(tenants);
	if (current) {
		storeCurrentTenantId(current.id);
		storeTenantToken(current.id, token);
	}
	return { tenants, currentTenantId: current?.id };
};

// Entering an inbox marks the user available in it, if that feature is on
// there (a backend setting). Leaving one marks them unavailable, like a
// logout, so it stops assigning chats to somebody who is not looking.
export const setAvailableOnEntry = async () => {
	try {
		const { feature_set_enabled } = await fetchUserAvailabilitySettings();

		if (feature_set_enabled) {
			const userData = await fetchCurrentUser();

			if (userData.profile && !userData.profile.is_available) {
				await updateUserAvailability(userData.id, { is_available: true });
			}
		}
	} catch (error: any | AxiosError) {
		// Accounts without a profile (e.g. superadmin) get a 404 here
		// but can still use the app; Main handles them the same way
		if (error?.response?.status !== 404) {
			throw error;
		}
	}
};
