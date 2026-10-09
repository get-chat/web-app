import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { login } from '@src/api/authApi';
import { startNewInboxGeneration } from '@src/api/axiosInstance';
import { updateUserAvailability } from '@src/api/usersApi';
import {
	getTokenWithoutPassword,
	setAvailableOnEntry,
} from '@src/helpers/InboxHelper';
import {
	clearContactProvidersData,
	storeCurrentTenantId,
	storeLastTenantId,
	storeTenantToken,
	storeToken,
} from '@src/helpers/StorageHelper';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { resetInboxState } from '@src/store/reducers/inboxesReducer';
import { Tenant } from '@src/types/tenants';

export type SwitchResult = 'switched' | 'needsPassword' | 'cancelled';

// Switching the app to another of the account's inboxes. Nothing of the
// previous inbox stays: the store is reset, Main mounts afresh (new loading
// screen, new websocket), and late responses for the old inbox are dropped.
const useInboxSwitch = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();

	const currentUser = useAppSelector((state) => state.currentUser.value);
	const isUserAvailable = useAppSelector(
		(state) => state.isUserAvailable.value
	);
	const isUserAvailabilityFeatureEnabled = useAppSelector(
		(state) => state.isUserAvailabilityFeatureEnabled.value
	);
	const hasFailedMessages = useAppSelector(
		(state) => state.UI.hasFailedMessages
	);

	const username = currentUser?.username ?? '';

	const enter = async (tenant: Tenant, token: string) => {
		// Leaving the inbox, with its token still in place
		if (isUserAvailabilityFeatureEnabled && isUserAvailable && currentUser) {
			try {
				await updateUserAvailability(currentUser.id, { is_available: false });
			} catch (error) {
				console.error(error);
			}
		}

		// From here on, answers to requests sent for the previous inbox are
		// dropped. Before anything of the new inbox is written: a late 401 for
		// the old inbox would otherwise log out and drop the new inbox's token
		// (clearUserSession removes the rejected token, read as the current
		// one).
		startNewInboxGeneration();

		storeToken(token);
		storeTenantToken(username, tenant.id, token);
		storeCurrentTenantId(tenant.id);
		if (username) storeLastTenantId(username, tenant.id);
		window.AndroidWebInterface?.registerUserToken(token);

		try {
			await setAvailableOnEntry();
		} catch (error) {
			console.error(error);
		}

		// The contacts of the address books connected to an inbox
		clearContactProvidersData();
		toast.dismiss();
		dispatch(resetInboxState());
		navigate({ pathname: '/main', search: location.search });
	};

	// Unsent messages are lost when the app leaves the inbox
	const confirmLeaving = () =>
		!hasFailedMessages ||
		window.confirm(
			t(
				'There are unsent messages in the chat. If you continue, they will be deleted. Are you sure you want to continue?'
			)
		);

	// Opens the inbox if a token is at hand, else the caller asks for the
	// password and calls switchWithPassword. `token`: one known already (an
	// accepted invite's); it is checked first, like a saved one.
	const switchTo = async (
		tenant: Tenant,
		knownToken?: string
	): Promise<SwitchResult> => {
		if (!confirmLeaving()) {
			return 'cancelled';
		}

		const token = await getTokenWithoutPassword(
			tenant.id,
			username,
			knownToken
		);
		if (!token) {
			return 'needsPassword';
		}
		await enter(tenant, token);
		return 'switched';
	};

	// Throws the login's error: 400 for a wrong password, 403 with a reason
	// when the inbox can't be entered (suspended, access removed)
	const switchWithPassword = async (tenant: Tenant, password: string) => {
		const { token } = await login({ username, password, tenant: tenant.id });
		await enter(tenant, token);
	};

	return { username, switchTo, switchWithPassword };
};

export default useInboxSwitch;
