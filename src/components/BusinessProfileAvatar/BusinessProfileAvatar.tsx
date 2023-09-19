import React, { useEffect, useRef, useState } from 'react';
import { binaryToBase64 } from '@src/helpers/ImageHelper';
import { AxiosError, AxiosResponse, CancelTokenSource } from 'axios';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import CustomAvatar from '@src/components/CustomAvatar';
import PubSub from 'pubsub-js';
import {
	EVENT_TOPIC_BULK_MESSAGE_TASK,
	EVENT_TOPIC_RELOAD_BUSINESS_PROFILE_PHOTO,
} from '@src/Constants';

interface Props {
	onClick?: () => void;
}

const BusinessProfileAvatar: React.FC<Props> = ({ onClick }) => {
	const { apiService } = React.useContext(ApplicationContext);

	const [isLoaded, setLoaded] = useState(false);
	const [profilePhoto, setProfilePhoto] = useState<string>();

	const cancelTokenSourceRef = useRef<CancelTokenSource>();

	const retrieveProfilePhoto = () => {
		apiService.retrieveProfilePhotoCall(
			cancelTokenSourceRef.current?.token,
			(response: AxiosResponse) => {
				const base64 = binaryToBase64(response.data);
				setProfilePhoto(base64);

				// Finish
				setLoaded(true);
			},
			(error: AxiosError) => {
				console.log(error);

				// No photo
				if (error?.response?.status === 404) {
					setProfilePhoto(undefined);

					// Finish
					setLoaded(true);
				} else if (error?.response?.status === 503) {
					// @ts-ignore
					window.displayCustomError(
						error.response.data?.reason ?? 'An error has occurred.'
					);
				} else {
					// @ts-ignore
					window.displayError(error);
				}
			}
		);
	};

	useEffect(() => {
		retrieveProfilePhoto();

		const reloadBusinessProfilePhotoEventToken = PubSub.subscribe(
			EVENT_TOPIC_RELOAD_BUSINESS_PROFILE_PHOTO,
			() => retrieveProfilePhoto()
		);

		return () => {
			PubSub.unsubscribe(reloadBusinessProfilePhotoEventToken);
		};
	}, []);

	return (
		<CustomAvatar
			src={profilePhoto ? 'data:image/png;base64,' + profilePhoto : undefined}
			onClick={onClick}
		/>
	);
};

export default BusinessProfileAvatar;
