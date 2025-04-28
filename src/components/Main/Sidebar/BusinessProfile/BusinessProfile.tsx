import React, { useEffect, useRef, useState } from 'react';
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
import FileInput from '../../../FileInput';
import { useTranslation } from 'react-i18next';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import { useAppSelector } from '@src/store/hooks';
import { prepareURLForDisplay } from '@src/helpers/URLHelper';
import InboxSelectorDialog from '@src/components/InboxSelectorDialog';
import { getApiBaseURLsMergedWithConfig } from '@src/helpers/StorageHelper';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import BusinessProfileAvatar from '@src/components/BusinessProfileAvatar';
import { AxiosError, AxiosResponse, CancelTokenSource } from 'axios';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_RELOAD_BUSINESS_PROFILE_PHOTO } from '@src/Constants';
import { binaryToBase64 } from '@src/helpers/ImageHelper';
import * as Styled from './BusinessProfile.styles';
import {
	fetchBusinessProfileSettings,
	fetchProfileAbout,
	partialUpdateBusinessProfileSettings,
} from '@src/api/settingsApi';

function BusinessProfile(props: any) {
	const { apiService } = React.useContext(ApplicationContext);
	const config = React.useContext(AppConfigContext);

	const { isReadOnly } = useAppSelector((state) => state.UI);
	const currentUser = useAppSelector((state) => state.currentUser.value);

	const isAdmin = currentUser?.profile?.role === 'admin';

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

	const retrieveBusinessProfile = async () => {
		try {
			// TODO: Make request cancellable
			const data = await fetchBusinessProfileSettings();

			setAddress(data.address ?? '');
			setDescription(data.description ?? '');
			setEmail(data.email ?? '');
			setVertical(data.vertical ?? '');

			let websitesArray = data.websites;
			if (websitesArray.length === 0) {
				websitesArray = [];
			}

			setWebsites({ ...websitesArray });

			// Load about
			await retrieveProfileAbout();
		} catch (error: any | AxiosError) {
			console.error(error);
		}
	};

	const updateBusinessProfile = async (
		event: React.FormEvent<HTMLFormElement>
	) => {
		event.preventDefault();

		setUpdating(true);

		try {
			// TODO: Make request cancellable
			await partialUpdateBusinessProfileSettings({
				address,
				description,
				email,
				vertical,
				websites: Object.values(websites),
			});
			await updateProfileAbout(event);
		} catch (error: any | AxiosError) {
			console.error(error);
			setUpdating(false);
		}
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

	const retrieveProfileAbout = async () => {
		try {
			const data = await fetchProfileAbout();
			setAbout(data.settings.profile?.about?.text ?? '');
		} catch (error: any | AxiosError) {
			console.error(error);
		} finally {
			retrieveProfilePhoto();
			setLoaded(true);
		}
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
		<Styled.BusinessProfileContainer>
			<Styled.Header>
				<IconButton onClick={props.onHide} size="large">
					<ArrowBack />
				</IconButton>
				<h3>{t('Business Profile')}</h3>
			</Styled.Header>

			<Styled.Body>
				{storedURLs.length > 1 && (
					<Styled.Section>
						<Styled.SectionHeader>
							<h5>{t('Your current inbox')}</h5>
						</Styled.SectionHeader>
						{prepareURLForDisplay(apiService.apiBaseURL)}
						<Styled.ChangeInboxLink
							href="#"
							className="ml-1"
							onClick={() => setInboxSelectorVisible(true)}
						>
							{t('Change')}
						</Styled.ChangeInboxLink>
					</Styled.Section>
				)}

				<Styled.Section>
					<Styled.SectionHeader>
						<h5>{t('Business Profile')}</h5>
					</Styled.SectionHeader>

					{!isLoaded && <span>{t('Loading')}</span>}

					{isLoaded && (
						<Styled.SubSection>
							<Styled.AvatarContainer $enabled={isAdmin}>
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
							</Styled.AvatarContainer>

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
									<Styled.SubSectionAction>
										<Button
											type="submit"
											disabled={isUpdating}
											color="primary"
											size="large"
										>
											{t('Update')}
										</Button>
									</Styled.SubSectionAction>
								)}
							</form>
						</Styled.SubSection>
					)}
				</Styled.Section>
			</Styled.Body>

			<InboxSelectorDialog
				isVisible={isInboxSelectorVisible}
				setVisible={setInboxSelectorVisible}
			/>
		</Styled.BusinessProfileContainer>
	);
}

export default BusinessProfile;
