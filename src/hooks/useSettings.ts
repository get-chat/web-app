import { useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import {
	AXIOS_ERROR_CODE_TIMEOUT,
	EVENT_TOPIC_RELOAD_BUSINESS_PROFILE_PHOTO,
} from '@src/Constants';
import { useAppDispatch } from '@src/store/hooks';
import { setState } from '@src/store/reducers/UIReducer';
import {
	checkSettingsRefreshStatus,
	fetchProfilePhoto,
} from '@src/api/settingsApi';
import { binaryToBase64 } from '@src/helpers/ImageHelper';
import PubSub from 'pubsub-js';

const MAX_RETRY = 15;
const RETRY_DELAY = 1000;

const useSettings = () => {
	const retryCount = useRef(0);

	const dispatch = useAppDispatch();

	const abortControllerRef = useRef<AbortController | null>(null);

	const [profilePhoto, setProfilePhoto] = useState<string>();

	useEffect(() => {
		abortControllerRef.current = new AbortController();

		return () => {
			// Cancelling ongoing requests
			abortControllerRef.current?.abort();
		};
	}, []);

	const handleCheckSettingsRefreshStatus = async () => {
		console.log('Checking settings refresh status...');

		const errorCallback = () => {
			if (retryCount.current < MAX_RETRY) {
				retryCount.current = retryCount.current + 1;

				console.log(
					'Retrying, attempt: ' + retryCount.current + '/' + MAX_RETRY
				);

				setTimeout(() => {
					handleCheckSettingsRefreshStatus();
				}, RETRY_DELAY);
			} else {
				console.log('Too many attempts to refresh settings!');
				dispatch(setState({ isRefreshingSettings: false }));
				retryCount.current = 0;

				window.displayCustomError(
					'Too many attempts to refresh settings! Please try again in a while.'
				);
			}
		};

		try {
			const data = await checkSettingsRefreshStatus(
				abortControllerRef.current?.signal
			);
			if (data.currently_refreshing) {
				console.log('Settings are still being refreshed.');
				errorCallback();
			} else {
				console.log('Settings are ready to be loaded.');

				retryCount.current = 0;
				await retrieveProfilePhoto();

				PubSub.publish(EVENT_TOPIC_RELOAD_BUSINESS_PROFILE_PHOTO);
			}
		} catch (error: any | AxiosError) {
			console.log(error);

			if (
				error.code === AXIOS_ERROR_CODE_TIMEOUT ||
				error.response?.status === 504
			) {
				errorCallback();
			} else {
				dispatch(setState({ isRefreshingSettings: false }));
			}
		}
	};

	const retrieveProfilePhoto = async () => {
		try {
			const data = await fetchProfilePhoto(abortControllerRef.current?.signal);
			const base64 = binaryToBase64(data);
			setProfilePhoto(base64);
		} catch (error: any | AxiosError) {
			console.error(error);
		}
	};

	return {
		profilePhoto,
		retrieveProfilePhoto,
		handleCheckSettingsRefreshStatus,
	};
};

export default useSettings;
