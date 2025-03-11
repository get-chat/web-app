import React, { useEffect, useRef, useState } from 'react';
import '../../../styles/BusinessProfile.css';
import {
	Button,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import FileInput from '../../FileInput';
import { useTranslation } from 'react-i18next';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import { useAppSelector } from '@src/store/hooks';
import { prepareURLForDisplay } from '@src/helpers/URLHelper';
import InboxSelectorDialog from '@src/components/InboxSelectorDialog';
import { getApiBaseURLsMergedWithConfig } from '@src/helpers/StorageHelper';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import BusinessProfileAvatar from '@src/components/BusinessProfileAvatar';
import { AxiosResponse, CancelTokenSource } from 'axios';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_RELOAD_BUSINESS_PROFILE_PHOTO } from '@src/Constants';
import { binaryToBase64 } from '@src/helpers/ImageHelper';

function BusinessProfile(props: any) {
	const { apiService } = React.useContext(ApplicationContext);
	const config = React.useContext(AppConfigContext);

	const { isReadOnly } = useAppSelector((state) => state.UI.value);
	const currentUser = useAppSelector((state) => state.currentUser.value);

	const isAdmin = currentUser?.isAdmin ?? false;

	const { t } = useTranslation();

	const [isLoaded, setLoaded] = useState(false);
	const [isUpdating, setUpdating] = useState(false);
	const [address, setAddress] = useState('');
	const [description, setDescription] = useState('');
	const [email, setEmail] = useState('');
	const [vertical, setVertical] = useState('');
	const [websites, setWebsites] = useState({});
	const [about, setAbout] = useState('');
	const [profilePhoto, setProfilePhoto] = useState<string>();

	const [isInboxSelectorVisible, setInboxSelectorVisible] = useState(false);
	const [storedURLs] = useState(getApiBaseURLsMergedWithConfig(config));

	const fileInput = useRef<HTMLInputElement>();

	const cancelTokenSourceRef = useRef<CancelTokenSource>();

	useEffect(() => {
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				// Escape
				props.onHide();
			}
		};

		document.addEventListener('keydown', handleKey);

		// Generate a token
		cancelTokenSourceRef.current = generateCancelToken();

		retrieveBusinessProfile();

		return () => {
			document.removeEventListener('keydown', handleKey);
			cancelTokenSourceRef.current?.cancel();
		};
	}, []);

	const retrieveBusinessProfile = () => {
		apiService.retrieveBusinessProfileCall(
			cancelTokenSourceRef.current?.token,
			(response: AxiosResponse) => {
				const data = response.data;

				setAddress(data.address);
				setDescription(data.description);
				setEmail(data.email);
				setVertical(data.vertical);

				let websitesArray = data.websites;
				if (websitesArray.length === 0) {
					websitesArray = [];
				}

				setWebsites({ ...websitesArray });

				// Load about
				retrieveProfileAbout();
			}
		);
	};

	const updateBusinessProfile = async (
		event: React.FormEvent<HTMLFormElement>
	) => {
		event.preventDefault();

		setUpdating(true);

		apiService.updateBusinessProfileCall(
			address,
			description,
			email,
			vertical,
			Object.values(websites),
			cancelTokenSourceRef.current?.token,
			() => {
				updateProfileAbout(event);
			},
			() => {
				setUpdating(false);
			}
		);
	};

	const retrieveProfilePhoto = () => {
		apiService.retrieveProfilePhotoCall(
			cancelTokenSourceRef.current?.token,
			(response: AxiosResponse) => {
				const base64 = binaryToBase64(response.data);
				setProfilePhoto(base64);
			},
			undefined
		);
	};

	const retrieveProfileAbout = () => {
		apiService.retrieveProfileAboutCall(
			cancelTokenSourceRef.current?.token,
			(response: AxiosResponse) => {
				const profile = response.data.settings?.profile;
				setAbout(profile?.about?.text);
				retrieveProfilePhoto();

				setLoaded(true);
			}
		);
	};

	const updateProfileAbout = async (
		event: React.FormEvent<HTMLFormElement>
	) => {
		event.preventDefault();

		apiService.updateProfileAboutCall(
			about,
			cancelTokenSourceRef.current?.token,
			() => {
				setUpdating(false);
			},
			() => {
				setUpdating(false);
			}
		);
	};

	const updateProfilePhoto = async (file: FileList) => {
		const formData = new FormData();
		formData.append('file_encoded', file[0]);

		apiService.updateProfilePhotoCall(
			formData,
			cancelTokenSourceRef.current?.token,
			() => {
				setUpdating(false);

				// Display new photo
				retrieveProfilePhoto();

				PubSub.publish(EVENT_TOPIC_RELOAD_BUSINESS_PROFILE_PHOTO);
			},
			() => {
				setUpdating(false);
			}
		);
	};

	const deleteProfilePhoto = () => {
		apiService.deleteProfilePhotoCall(
			cancelTokenSourceRef.current?.token,
			() => {
				//setProfilePhoto(undefined);
				PubSub.publish(EVENT_TOPIC_RELOAD_BUSINESS_PROFILE_PHOTO);
			}
		);
	};

	const verticalOptions = [
		'Automotive',
		'Beauty, Spa and Salon',
		'Clothing and Apparel',
		'Education',
		'Entertainment',
		'Event Planning and Service',
		'Finance and Banking',
		'Food and Grocery',
		'Public Service',
		'Hotel and Lodging',
		'Medical and Health',
		'Non-profit',
		'Professional Services',
		'Shopping and Retail',
		'Travel and Transportation',
		'Restaurant',
		'Other',
	];

	const handleBusinessProfileAvatarClick = () => {
		if (isAdmin && !isReadOnly) fileInput.current?.click();
	};

	return (
		<div className="sidebarBusinessProfile">
			<div className="sidebarBusinessProfile__header">
				<IconButton onClick={props.onHide} size="large">
					<ArrowBack />
				</IconButton>

				<h3>{t('Business Profile')}</h3>
			</div>

			<div className="sidebarBusinessProfile__body">
				{storedURLs.length > 1 && (
					<div className="sidebarBusinessProfile__body__section">
						<div className="sidebarBusinessProfile__body__section__header">
							<h5>{t('Your current inbox')}</h5>
						</div>

						{prepareURLForDisplay(apiService.apiBaseURL)}
						<a
							href="#"
							className="sidebarBusinessProfile__body__section__changeInbox ml-1"
							onClick={() => setInboxSelectorVisible(true)}
						>
							{t('Change')}
						</a>
					</div>
				)}

				<div className="sidebarBusinessProfile__body__section">
					<div className="sidebarBusinessProfile__body__section__header">
						<h5>{t('Business Profile')}</h5>
					</div>

					{!isLoaded && <span>{t('Loading')}</span>}

					{isLoaded && (
						<div className="sidebarBusinessProfile__body__section__subSection">
							<div
								className={
									'sidebarBusinessProfile__body__avatarContainer' +
									(isAdmin ? ' editable' : '')
								}
							>
								<FileInput
									innerRef={fileInput}
									handleSelectedFiles={(file: FileList) =>
										updateProfilePhoto(file)
									}
									accept="image/jpeg, image/png"
									multiple={false}
								/>
								<BusinessProfileAvatar
									onClick={handleBusinessProfileAvatarClick}
								/>

								{profilePhoto && isAdmin && !isReadOnly && (
									<Button onClick={deleteProfilePhoto} color="secondary">
										Delete profile photo
									</Button>
								)}
							</div>

							<form onSubmit={updateBusinessProfile}>
								<div>
									<TextField
										variant="standard"
										value={about}
										onChange={(e) => setAbout(e.target.value)}
										label={t('About')}
										size="medium"
										multiline={true}
										fullWidth={true}
										InputProps={{
											readOnly: !isAdmin || isReadOnly,
										}}
									/>
									<TextField
										variant="standard"
										value={address}
										onChange={(e) => setAddress(e.target.value)}
										label={t('Address')}
										size="medium"
										fullWidth={true}
										InputProps={{
											readOnly: !isAdmin || isReadOnly,
										}}
									/>
									<TextField
										variant="standard"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										label={t('Description')}
										size="medium"
										fullWidth={true}
										InputProps={{
											readOnly: !isAdmin || isReadOnly,
										}}
									/>
									<TextField
										variant="standard"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										label={t('E-mail')}
										size="medium"
										fullWidth={true}
										InputProps={{
											readOnly: !isAdmin || isReadOnly,
										}}
									/>

									<FormControl
										variant="standard"
										fullWidth={true}
										disabled={!isAdmin || isReadOnly}
									>
										<InputLabel id="vertical-label">{t('Vertical')}</InputLabel>
										<Select
											variant="standard"
											value={vertical}
											onChange={(event) => setVertical(event.target.value)}
											labelId="vertical-label"
										>
											<MenuItem value="">{t('None')}</MenuItem>

											{verticalOptions.map((verticalOption, index) => (
												<MenuItem key={index} value={verticalOption}>
													{verticalOption}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</div>

								{isAdmin && !isReadOnly && (
									<div className="sidebarBusinessProfile__body__section__subSection__action">
										<Button
											type="submit"
											disabled={isUpdating}
											color="primary"
											size="large"
										>
											{t('Update')}
										</Button>
									</div>
								)}
							</form>
						</div>
					)}
				</div>
			</div>

			<InboxSelectorDialog
				isVisible={isInboxSelectorVisible}
				setVisible={setInboxSelectorVisible}
			/>
		</div>
	);
}

export default BusinessProfile;
