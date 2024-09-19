import { ApiService } from '@src/api/ApiService';
import { getURLParams } from '@src/helpers/URLHelper';
import { clearUserSession } from '@src/helpers/ApiHelper';
import { AxiosError, AxiosResponse } from 'axios';
import { storeToken } from '@src/helpers/StorageHelper';

const useIdToken = () => {
	const handle = (apiService: ApiService, onComplete?: () => void) => {
		const refreshToken = getURLParams().get('refresh_token');
		const keepRefreshToken = getURLParams().get('keep_refresh_token') === '1';
		if (refreshToken) {
			// Clear existing user session
			clearUserSession(undefined, undefined, undefined);

			// Converting refresh token
			apiService.convertRefreshTokenCall(
				refreshToken,
				keepRefreshToken,
				(response: AxiosResponse) => {
					// Store token in local storage
					storeToken(response.data.token);
				},
				(error: AxiosError) => {
					const reason = btoa(error.response?.data?.reason ?? '');

					// Redirect it this way as routes are not initialized yet
					window.history.pushState(
						null,
						'',
						'/id_token_error?reason=' + reason
					);
				},
				() => {
					onComplete?.();
				}
			);
		} else {
			onComplete?.();
		}
	};

	return {
		handle,
	};
};

export default useIdToken;
