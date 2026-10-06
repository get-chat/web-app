import React, { useContext, useEffect, useId, useRef, useState } from 'react';
import { QrCode } from '@src/components/icons';
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
import { cn } from '@src/lib/utils';
import ProfilePanel, {
	ProfileSection,
	ProfileSectionHeader,
	profileTextClass,
} from '@src/components/ProfilePanel';
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
		<ProfilePanel
			title={t('Business Profile')}
			onHide={onHide}
			isExiting={isExiting}
			onAnimationEnd={onAnimationEnd}
		>
			{storedURLs.length > 1 && (
				<ProfileSection>
					<ProfileSectionHeader title={t('Your current inbox')} />
					{prepareURLForDisplay(api.defaults.baseURL ?? '')}
					<a
						href="#"
						className="ml-1.25 text-(--color-secondary)"
						onClick={() => setInboxSelectorVisible(true)}
					>
						{t('Change')}
					</a>
				</ProfileSection>
			)}

			<ProfileSection>
				<ProfileSectionHeader
					title={t('Business Profile')}
					action={<QrCode onClick={showOpenInWhatsApp} />}
				/>

				{!isLoaded && <span className={profileTextClass}>{t('Loading')}</span>}

				{isLoaded && (
					<div>
						<div className="mt-3.75 flex flex-col items-center justify-center gap-7.5 pb-3.75">
							<FileInput
								innerRef={fileInput}
								handleSelectedFiles={(file: FileList) =>
									doUpdateProfilePhoto(file)
								}
								accept="image/jpeg, image/png"
								multiple={false}
							/>

							<BusinessProfileAvatar
								className={cn(
									'size-50 text-[5rem]/none transition-opacity duration-100 ease-linear',
									isAdmin && 'cursor-pointer hover:opacity-75'
								)}
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
						</div>

						<form onSubmit={updateBusinessProfile}>
							<div>
								<Field className="mb-5 gap-1.5" data-disabled>
									<FieldLabel htmlFor={`${id}-phone-number`}>
										{t('Phone number')}
									</FieldLabel>
									<Input
										id={`${id}-phone-number`}
										value={phoneNumber ? `+${phoneNumber}` : ''}
										readOnly={!isAdmin || isReadOnly}
										disabled={true}
									/>
								</Field>

								<Field
									className="mb-5 gap-1.5"
									data-disabled={isUpdating || undefined}
									data-invalid={Boolean(aboutError) || undefined}
								>
									<FieldLabel htmlFor={`${id}-about`}>{t('About')}</FieldLabel>
									<Textarea
										id={`${id}-about`}
										className="min-h-9"
										value={about}
										onChange={(e) => setAbout(e.target.value)}
										readOnly={!isAdmin || isReadOnly}
										disabled={isUpdating}
										aria-invalid={Boolean(aboutError) || undefined}
									/>
								</Field>

								{Boolean(aboutError) && (
									<div className="-mt-2.5 mb-5 text-[13px] text-destructive-dark">
										{t(aboutError ?? '')}
									</div>
								)}

								<Field
									className="mb-5 gap-1.5"
									data-disabled={isUpdating || undefined}
								>
									<FieldLabel htmlFor={`${id}-address`}>
										{t('Address')}
									</FieldLabel>
									<Input
										id={`${id}-address`}
										value={address}
										onChange={(e) => setAddress(e.target.value)}
										readOnly={!isAdmin || isReadOnly}
										disabled={isUpdating}
									/>
								</Field>
								<Field
									className="mb-5 gap-1.5"
									data-disabled={isUpdating || undefined}
								>
									<FieldLabel htmlFor={`${id}-description`}>
										{t('Description')}
									</FieldLabel>
									<Input
										id={`${id}-description`}
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										readOnly={!isAdmin || isReadOnly}
										disabled={isUpdating}
									/>
								</Field>
								<Field
									className="mb-5 gap-1.5"
									data-disabled={isUpdating || undefined}
								>
									<FieldLabel htmlFor={`${id}-email`}>{t('E-mail')}</FieldLabel>
									<Input
										id={`${id}-email`}
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										readOnly={!isAdmin || isReadOnly}
										disabled={isUpdating}
									/>
								</Field>

								<Field
									className="mb-5 gap-1.5"
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
										<SelectTrigger id={`${id}-vertical`} className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={VERTICAL_NONE}>{t('None')}</SelectItem>

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
								<div className="flex justify-end">
									<Button
										type="submit"
										variant="ghost"
										color="primary"
										size="lg"
										disabled={isUpdating}
									>
										{t('Update')}
									</Button>
								</div>
							)}
						</form>
					</div>
				)}
			</ProfileSection>

			<InboxSelectorDialog
				isVisible={isInboxSelectorVisible}
				setVisible={setInboxSelectorVisible}
			/>
		</ProfilePanel>
	);
};

export default BusinessProfile;
