import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { logout } from '@src/api/authApi';
import { updateUserAvailability } from '@src/api/usersApi';
import { clearUserSession } from '@src/helpers/ApiHelper';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setCurrentUser } from '@src/store/reducers/currentUserReducer';
import { setTemplates } from '@src/store/reducers/templatesReducer';

// Logging out from inside the app (the options menu, an invite for another
// account)
const useLogout = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const currentUser = useAppSelector((state) => state.currentUser.value);
	const isUserAvailable = useAppSelector(
		(state) => state.isUserAvailable.value
	);
	const isUserAvailabilityFeatureEnabled = useAppSelector(
		(state) => state.isUserAvailabilityFeatureEnabled.value
	);

	return async () => {
		// Set as unavailable on logout
		if (isUserAvailabilityFeatureEnabled && isUserAvailable && !!currentUser) {
			try {
				await updateUserAvailability(currentUser.id, { is_available: false });
			} catch (error: any | AxiosError) {
				console.error(error);
			}
		}

		// Clear the backend session too, not just the local token. Otherwise a
		// stale session lingers: the login page then shows "Continue as" and,
		// on a "Login with 360dialog" retry, takes the sso_switch path (which
		// depends on 360dialog's currently broken authx logout) instead of a
		// clean login. Best effort — ignored if there is no session to clear.
		try {
			await logout();
		} catch (error: any | AxiosError) {
			console.error(error);
		}

		clearUserSession(undefined, undefined, navigate);

		// TODO: Consider calling it in clearUserSession method
		dispatch(setCurrentUser(undefined));
		dispatch(setTemplates({}));
	};
};

export default useLogout;
