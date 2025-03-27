import { ApiService } from '@src/api/ApiService';
import { getURLParams } from '@src/helpers/URLHelper';
import { clearUserSession } from '@src/helpers/ApiHelper';
import { AxiosError } from 'axios';
import { storeToken } from '@src/helpers/StorageHelper';
import { convertRefreshToken } from '@src/api/authApi';

const useRefreshToken = () => {
	const handle = async (apiService: ApiService, onComplete?: () => void) => {
		const refreshToken = getURLParams().get('refresh_token');
		const keepRefreshToken = getURLParams().get('keep_refresh_token') === '1';
		if (refreshToken) {
			// Clear existing user session
			clearUserSession(undefined, undefined, undefined);

			// Converting refresh token
			try {
				const data = await convertRefreshToken({
					refresh_token: refreshToken,
					keep_refresh_token: keepRefreshToken,
				});
				// Store token in local storage
				storeToken(data.token);
			} catch (error: any | AxiosError) {
				const reason = btoa(error.response?.data?.reason ?? '');

				// Redirect it this way as routes are not initialized yet
				window.history.pushState(null, '', '/id_token_error?reason=' + reason);
			} finally {
				onComplete?.();
			}
		} else {
			onComplete?.();
		}
	};

	return {
		handle,
	};
};

export default useRefreshToken;
