import React, { useEffect, useRef, useState } from 'react';
import { binaryToBase64 } from '@src/helpers/ImageHelper';
import { AxiosError, AxiosResponse, CancelTokenSource } from 'axios';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import CustomAvatar from '@src/components/CustomAvatar';

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
	}, []);

	return (
		<CustomAvatar
			src={profilePhoto ? 'data:image/png;base64,' + profilePhoto : undefined}
			onClick={onClick}
		/>
	);
};

export default BusinessProfileAvatar;
