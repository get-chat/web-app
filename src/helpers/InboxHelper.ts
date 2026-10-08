import { AxiosError } from 'axios';
import { fetchSessionToken } from '@src/api/authApi';
import {
	acceptInvite,
	fetchTenants,
	switchSessionTenant,
} from '@src/api/tenantsApi';
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
import { AcceptInviteRequest, Tenant } from '@src/types/tenants';

/*
 * Multi-tenant inboxes (MT 3.6, backend inbox#1154). One account can be a
 * member of several inboxes, and an auth token belongs to one of them. The
 * backend gives no token for another inbox in exchange for a token (decision
 * D11: a leaked token must not open every inbox), so the app gets one with:
 *   1. a token at hand: one an accepted invite just gave, else the one this
 *      device saved for the account and inbox before;
 *   2. the backend session, if this browser has one of the same account (a
 *      "Login with 360dialog" or admin panel login): it is switched to the
 *      inbox and gives its token;
 *   3. otherwise the password, once per inbox and device.
 */

// Whether `token` opens the backend as `username`. 'rejected' is the backend
// saying no (401/403) or answering as another account; a network error or a
// server error is 'unknown', and such a token is not thrown away.
const checkToken = async (
	token: string,
	username: string
): Promise<'valid' | 'rejected' | 'unknown'> => {
	try {
		const user = await fetchCurrentUser({
			headers: { Authorization: `Token ${token}` },
		});
		return user.username === username ? 'valid' : 'rejected';
	} catch (error: any | AxiosError) {
		const status = error?.response?.status;
		return status === 401 || status === 403 ? 'rejected' : 'unknown';
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
	if (!sessionToken || (await checkToken(sessionToken, username)) !== 'valid') {
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

// A token for the inbox without asking for the password, if there is a way.
// `token`: one at hand already (an accepted invite's), checked like a saved
// one, so an unusable token ends in the password step instead of a logout.
export const getTokenWithoutPassword = async (
	tenantId: string,
	username: string,
	token?: string
) => {
	const saved = getTenantToken(username, tenantId);
	const candidates = saved === token ? [token] : [token, saved];
	for (const candidate of candidates) {
		if (!candidate) continue;
		const result = await checkToken(candidate, username);
		if (result === 'valid') {
			return candidate;
		}
		if (result === 'rejected') {
			// Revoked, or the membership was switched off
			removeTenantToken(candidate);
		}
	}
	return getTokenFromSession(tenantId, username);
};

// Accepts an invite and keeps the new membership's token right away,
// replacing any saved for the inbox before: for an account without a password
// it may be the only way into it. Backends before inbox!1117 send none.
export const acceptInviteKeepingToken = async (data: AcceptInviteRequest) => {
	const accepted = await acceptInvite(data);
	if (accepted.token) {
		storeTenantToken(accepted.username, accepted.tenant.id, accepted.token);
	}
	return accepted;
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

// The account's inboxes and which one this is, remembering the token as the
// account's for that inbox
export const loadTenants = async (token: string, username: string) => {
	const { tenants } = await fetchTenants();
	const current = await findCurrentTenant(tenants);
	if (current) {
		storeCurrentTenantId(current.id);
		storeTenantToken(username, current.id, token);
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
