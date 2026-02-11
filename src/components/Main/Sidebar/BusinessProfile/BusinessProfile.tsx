import React, { useContext, useEffect, useRef, useState } from 'react';
import {
	Button,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from '@mui/material';
import { ArrowBack, QrCode } from '@mui/icons-material';
import FileInput from '../../../FileInput';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { prepareURLForDisplay } from '@src/helpers/URLHelper';
import InboxSelectorDialog from '@src/components/InboxSelectorDialog';
import { getApiBaseURLsMergedWithConfig } from '@src/helpers/StorageHelper';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import BusinessProfileAvatar from '@src/components/BusinessProfileAvatar';
import { AxiosError } from 'axios';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_RELOAD_BUSINESS_PROFILE_PHOTO } from '@src/Constants';
import * as Styled from './BusinessProfile.styles';
import {
	deleteProfilePhoto,
	fetchBusinessProfileSettings,
	fetchProfileAbout,
	partialUpdateBusinessProfileSettings,
	updateProfileAbout,
	updateProfilePhoto,
} from '@src/api/settingsApi';
import api from '@src/api/axiosInstance';
import { setState } from '@src/store/reducers/UIReducer';

interface Props {
	onHide: () => void;
	handleCheckSettingsRefreshStatus: () => Promise<void>;
	profilePhoto: string | undefined;
	showOpenInWhatsApp: () => void;
}

const BusinessProfile: React.FC<Props> = ({
	onHide,
	handleCheckSettingsRefreshStatus,
	profilePhoto,
	showOpenInWhatsApp,
}) => {
	const config = useContext(AppConfigContext);

	const dispatch = useAppDispatch();

	const { isReadOnly } = useAppSelector((state) => state.UI);
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const phoneNumber = useAppSelector((state) => state.phoneNumber.value);

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
	const [aboutError, setAboutError] = useState<string | null>(null);

	const [isInboxSelectorVisible, setInboxSelectorVisible] = useState(false);
	const [storedURLs] = useState(getApiBaseURLsMergedWithConfig(config));

	const fileInput = useRef<HTMLInputElement>();

	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				// Escape
				onHide();
			}
		};

		document.addEventListener('keydown', handleKey);

		// Generate a token
		abortControllerRef.current = new AbortController();

		retrieveBusinessProfile();

		return () => {
			document.removeEventListener('keydown', handleKey);
			abortControllerRef.current?.abort();
		};
	}, []);

	const retrieveBusinessProfile = async () => {
		try {
			const data = await fetchBusinessProfileSettings(
				abortControllerRef.current?.signal
			);

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

		setAboutError(null);

		// Check if about field is empty
		if (!about.trim()) {
			setAboutError('This field is required!');
			return;
		}

		setUpdating(true);

		try {
			await partialUpdateBusinessProfileSettings(
				{
					address,
					description,
					email,
					vertical,
					websites: Object.values(websites),
				},
				abortControllerRef.current?.signal
			);
			await doUpdateProfileAbout(event);
		} catch (error: any | AxiosError) {
			console.error(error);
			setUpdating(false);
		}
	};

	const retrieveProfileAbout = async () => {
		try {
			const data = await fetchProfileAbout();
			setAbout(data.settings.profile?.about?.text ?? '');
		} catch (error: any | AxiosError) {
			console.error(error);
		} finally {
			setLoaded(true);
		}
	};

	const doUpdateProfileAbout = async (
		event: React.FormEvent<HTMLFormElement>
	) => {
		event.preventDefault();

		try {
			await updateProfileAbout(
				{
					text: about,
				},
				abortControllerRef.current?.signal
			);
		} catch (error: any | AxiosError) {
			console.error(error);
		} finally {
			setUpdating(false);
		}
	};

	const doUpdateProfilePhoto = async (file: FileList) => {
		const formData = new FormData();
		formData.append('file_encoded', file[0]);

		dispatch(setState({ isUploadingProfilePhoto: true }));

		try {
			await updateProfilePhoto(formData, abortControllerRef.current?.signal);

			// Set refreshing state to true
			dispatch(setState({ isRefreshingSettings: true }));

			// Check settings refresh status and load the new profile photo
			await handleCheckSettingsRefreshStatus();
		} catch (error: any | AxiosError) {
			console.error(error);
			window.displayError(error);
		} finally {
			setUpdating(false);
			dispatch(setState({ isUploadingProfilePhoto: false }));
		}
	};

	const doDeleteProfilePhoto = async () => {
		try {
			await deleteProfilePhoto(abortControllerRef.current?.signal);
			//setProfilePhoto(undefined);
			PubSub.publish(EVENT_TOPIC_RELOAD_BUSINESS_PROFILE_PHOTO);
		} catch (error: any | AxiosError) {
			console.error(error);
		}
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
				<IconButton onClick={onHide} size="large">
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
						{prepareURLForDisplay(api.defaults.baseURL ?? '')}
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
						<QrCode onClick={showOpenInWhatsApp} />
					</Styled.SectionHeader>

					{!isLoaded && <span>{t('Loading')}</span>}

					{isLoaded && (
						<Styled.SubSection>
							<Styled.AvatarContainer $enabled={isAdmin}>
								<FileInput
									innerRef={fileInput}
									handleSelectedFiles={(file: FileList) =>
										doUpdateProfilePhoto(file)
									}
									accept="image/jpeg, image/png"
									multiple={false}
								/>

								<BusinessProfileAvatar
									onClick={handleBusinessProfileAvatarClick}
									profilePhoto={profilePhoto}
								/>

								{profilePhoto && isAdmin && !isReadOnly && (
									<Button onClick={doDeleteProfilePhoto} color="secondary">
										{t('Delete profile photo')}
									</Button>
								)}
							</Styled.AvatarContainer>

							<form onSubmit={updateBusinessProfile}>
								<div>
									<TextField
										variant="standard"
										value={phoneNumber ? `+${phoneNumber}` : ''}
										label={t('Phone number')}
										size="medium"
										fullWidth={true}
										InputProps={{
											readOnly: !isAdmin || isReadOnly,
										}}
										disabled={true}
									/>

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
										disabled={isUpdating}
										error={Boolean(aboutError)}
									/>

									{Boolean(aboutError) && (
										<Styled.FieldErrorMessage>
											{t(aboutError ?? '')}
										</Styled.FieldErrorMessage>
									)}

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
										disabled={isUpdating}
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
										disabled={isUpdating}
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
										disabled={isUpdating}
									/>

									<FormControl
										variant="standard"
										fullWidth={true}
										disabled={!isAdmin || isReadOnly || isUpdating}
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
													{t(verticalOption)}
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
};

export default BusinessProfile;
