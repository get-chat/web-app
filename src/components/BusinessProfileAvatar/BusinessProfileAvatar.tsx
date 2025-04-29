import React, { useEffect, useRef, useState } from 'react';
import { binaryToBase64 } from '@src/helpers/ImageHelper';
import { AxiosError, CancelTokenSource } from 'axios';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import CustomAvatar from '@src/components/CustomAvatar';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_RELOAD_BUSINESS_PROFILE_PHOTO } from '@src/Constants';
import { fetchProfilePhoto } from '@src/api/settingsApi';

interface Props {
	className?: string;
	onClick?: () => void;
}

const BusinessProfileAvatar: React.FC<Props> = ({ className, onClick }) => {
	const { apiService } = React.useContext(ApplicationContext);

	const [isLoaded, setLoaded] = useState(false);
	const [profilePhoto, setProfilePhoto] = useState<string>();

	const cancelTokenSourceRef = useRef<CancelTokenSource>();

	const handleProfilePhotoError = (error: AxiosError) => {
		try {
			// Convert ArrayBuffer to string
			const textDecoder = new TextDecoder();
			const responseText = textDecoder.decode(error.response?.data);

			// Attempt to parse the string as JSON
			const parsedError = JSON.parse(responseText);

			// @ts-ignore
			window.displayCustomError(parsedError.reason ?? 'An error has occurred.');
		} catch (e) {
			console.error('Error parsing response:', e);
		}
	};

	const retrieveProfilePhoto = async () => {
		try {
			// TODO: Make request cancellable
			const data = await fetchProfilePhoto();
			const base64 = binaryToBase64(data);
			setProfilePhoto(base64);

			// Finish
			setLoaded(true);
		} catch (error: any | AxiosError) {
			console.error(error);

			// No photo
			if (error?.response?.status === 404) {
				setProfilePhoto(undefined);

				// Finish
				setLoaded(true);
			} else if (error?.response?.status === 503) {
				handleProfilePhotoError(error);
			} else {
				window.displayError(error);
			}
		}
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
			className={className}
			src={profilePhoto ? 'data:image/png;base64,' + profilePhoto : undefined}
			onClick={onClick}
		/>
	);
};

export default BusinessProfileAvatar;
