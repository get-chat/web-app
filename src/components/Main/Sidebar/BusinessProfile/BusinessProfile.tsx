import React, { useContext, useEffect, useId, useRef, useState } from 'react';
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
	partialUpdateBusinessProfileSettings,
	updateProfilePhoto,
} from '@src/api/settingsApi';
import api from '@src/api/axiosInstance';
import { setState } from '@src/store/reducers/UIReducer';
import { PanelTransitionProps } from '@src/styles/panelTransitions';
import { Button } from '@src/components/ui/button';
import { Field, FieldLabel } from '@src/components/ui/field';
import { Input } from '@src/components/ui/input';
import { Textarea } from '@src/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@src/components/ui/select';

// Radix's Select doesn't allow an empty value, "None" maps back to ''
const VERTICAL_NONE = '__none__';

interface Props extends PanelTransitionProps {
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
	isExiting,
	onAnimationEnd,
}) => {
	const config = useContext(AppConfigContext);

	const dispatch = useAppDispatch();

	const { isReadOnly } = useAppSelector((state) => state.UI);
	const currentUser = useAppSelector((state) => state.currentUser.value);
	const phoneNumber = useAppSelector((state) => state.phoneNumber.value);

	const isAdmin = currentUser?.profile?.role === 'admin';

	const { t } = useTranslation();

	const id = useId();

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
			setAbout(data.about ?? '');

			let websitesArray = data.websites;
			if (websitesArray.length === 0) {
				websitesArray = [];
			}

			setWebsites({ ...websitesArray });
		} catch (error: any | AxiosError) {
			console.error(error);
		} finally {
			setLoaded(true);
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
					about: about,
				},
				abortControllerRef.current?.signal
			);
		} catch (error: any | AxiosError) {
			console.error(error);
			setUpdating(false);
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
		{ value: 'AUTO', label: 'Automotive' },
		{ value: 'BEAUTY', label: 'Beauty, Spa and Salon' },
		{ value: 'APPAREL', label: 'Clothing and Apparel' },
		{ value: 'EDU', label: 'Education' },
		{ value: 'ENTERTAIN', label: 'Entertainment' },
		{ value: 'EVENT_PLAN', label: 'Event Planning and Service' },
		{ value: 'FINANCE', label: 'Finance and Banking' },
		{ value: 'GROCERY', label: 'Food and Grocery' },
		{ value: 'GOVT', label: 'Public Service' },
		{ value: 'HOTEL', label: 'Hotel and Lodging' },
		{ value: 'HEALTH', label: 'Medical and Health' },
		{ value: 'NONPROFIT', label: 'Non-profit' },
		{ value: 'PROF_SERVICES', label: 'Professional Services' },
		{ value: 'RETAIL', label: 'Shopping and Retail' },
		{ value: 'TRAVEL', label: 'Travel and Transportation' },
		{ value: 'RESTAURANT', label: 'Restaurant' },
		{ value: 'ALCOHOL', label: 'Alcohol' },
		{ value: 'ONLINE_GAMBLING', label: 'Online Gambling' },
		{ value: 'PHYSICAL_GAMBLING', label: 'Physical Gambling' },
		{ value: 'OTC_DRUGS', label: 'OTC Drugs' },
		{ value: 'MATRIMONY_SERVICE', label: 'Matrimony Service' },
		{ value: 'OTHER', label: 'Other' },
	];

	const handleBusinessProfileAvatarClick = () => {
		if (isAdmin && !isReadOnly) fileInput.current?.click();
	};

	return (
		<Styled.BusinessProfileContainer
			$isExiting={isExiting}
			onAnimationEnd={onAnimationEnd}
		>
			<Styled.Header>
				<Button variant="ghost" color="neutral" size="icon-xl" onClick={onHide}>
					<ArrowBack />
				</Button>
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
									<Button
										variant="ghost"
										color="secondary"
										onClick={doDeleteProfilePhoto}
									>
										Delete profile photo
									</Button>
								)}
							</Styled.AvatarContainer>

							<form onSubmit={updateBusinessProfile}>
								<div>
									<Field className="gap-1.5" data-disabled>
										<FieldLabel htmlFor={`${id}-phone-number`}>
											{t('Phone number')}
										</FieldLabel>
										<Input
											id={`${id}-phone-number`}
											variant="underline"
											value={phoneNumber ? `+${phoneNumber}` : ''}
											readOnly={!isAdmin || isReadOnly}
											disabled={true}
										/>
									</Field>

									<Field
										className="gap-1.5"
										data-disabled={isUpdating || undefined}
										data-invalid={Boolean(aboutError) || undefined}
									>
										<FieldLabel htmlFor={`${id}-about`}>
											{t('About')}
										</FieldLabel>
										<Textarea
											id={`${id}-about`}
											variant="underline"
											className="min-h-9"
											value={about}
											onChange={(e) => setAbout(e.target.value)}
											readOnly={!isAdmin || isReadOnly}
											disabled={isUpdating}
											aria-invalid={Boolean(aboutError) || undefined}
										/>
									</Field>

									{Boolean(aboutError) && (
										<Styled.FieldErrorMessage>
											{t(aboutError ?? '')}
										</Styled.FieldErrorMessage>
									)}

									<Field
										className="gap-1.5"
										data-disabled={isUpdating || undefined}
									>
										<FieldLabel htmlFor={`${id}-address`}>
											{t('Address')}
										</FieldLabel>
										<Input
											id={`${id}-address`}
											variant="underline"
											value={address}
											onChange={(e) => setAddress(e.target.value)}
											readOnly={!isAdmin || isReadOnly}
											disabled={isUpdating}
										/>
									</Field>
									<Field
										className="gap-1.5"
										data-disabled={isUpdating || undefined}
									>
										<FieldLabel htmlFor={`${id}-description`}>
											{t('Description')}
										</FieldLabel>
										<Input
											id={`${id}-description`}
											variant="underline"
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											readOnly={!isAdmin || isReadOnly}
											disabled={isUpdating}
										/>
									</Field>
									<Field
										className="gap-1.5"
										data-disabled={isUpdating || undefined}
									>
										<FieldLabel htmlFor={`${id}-email`}>
											{t('E-mail')}
										</FieldLabel>
										<Input
											id={`${id}-email`}
											variant="underline"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											readOnly={!isAdmin || isReadOnly}
											disabled={isUpdating}
										/>
									</Field>

									<Field
										className="gap-1.5"
										data-disabled={
											!isAdmin || isReadOnly || isUpdating || undefined
										}
									>
										<FieldLabel htmlFor={`${id}-vertical`}>
											{t('Vertical')}
										</FieldLabel>
										<Select
											value={vertical || VERTICAL_NONE}
											onValueChange={(value) =>
												setVertical(value === VERTICAL_NONE ? '' : value)
											}
											disabled={!isAdmin || isReadOnly || isUpdating}
										>
											<SelectTrigger
												id={`${id}-vertical`}
												variant="underline"
												className="w-full"
											>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={VERTICAL_NONE}>
													{t('None')}
												</SelectItem>

												{verticalOptions.map((verticalOption) => (
													<SelectItem
														key={verticalOption.value}
														value={verticalOption.value}
													>
														{t(verticalOption.label)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</Field>
								</div>

								{isAdmin && !isReadOnly && (
									<Styled.SubSectionAction>
										<Button
											type="submit"
											variant="ghost"
											color="primary"
											size="lg"
											disabled={isUpdating}
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
