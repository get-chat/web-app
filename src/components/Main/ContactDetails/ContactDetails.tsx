import React, { useEffect, useState } from 'react';
import PersonIcon from '@src/components/icons/Person';
import GroupIcon from '@src/components/icons/Group';
import { CALENDAR_NORMAL, CHAT_KEY_PREFIX } from '@src/Constants';
import Moment from 'react-moment';
// @ts-ignore
import googleLogo from '../../../assets/images/ic-google.png';
// @ts-ignore
import hubspotLogo from '../../../assets/images/ic-hubspot.png';
import { extractAvatarFromContactProviderData } from '@src/helpers/Helpers';
import { addPlus, isPhoneNumber } from '@src/helpers/PhoneNumberHelper';
import { useIsUserActionsRestricted } from '@src/hooks/useIsUserActionsRestricted';
import { Trans, useTranslation } from 'react-i18next';
import { setFilterTagId } from '@src/store/reducers/filterTagIdReducer';
import CustomAvatar from '@src/components/CustomAvatar';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import SellIcon from '@src/components/icons/Sell';
import { setState } from '@src/store/reducers/UIReducer';
import { Chat } from '@src/types/chats';
import PrintMessage from '@src/components/PrintMessage';
import { PanelTransitionProps } from '@src/styles/panelTransitions';
import SidePanel from '@src/components/SidePanel';
import { ProfileSection } from '@src/components/ProfilePanel';

// The icons in front of the assignees
const assigneeIconClassName = 'mr-2.5 size-[0.8em]! align-middle';

interface Props extends PanelTransitionProps {
	contactProvidersData: { [key: string]: any };
	retrieveContactData: (personWaId: string, onComplete?: () => void) => void;
}

const ContactDetails: React.FC<Props> = ({
	contactProvidersData,
	retrieveContactData,
	isExiting,
	onAnimationEnd,
}) => {
	const { t } = useTranslation();

	const chats = useAppSelector((state) => state.chats.value);
	const { chosenContact: contactData } = useAppSelector((state) => state.UI);
	const currentChatTags = useAppSelector(
		(state) => state.currentChatTags.value
	);

	const [chat, setChat] = useState<Chat>();

	const isUserActionsRestricted = useIsUserActionsRestricted();

	const dispatch = useAppDispatch();

	const hideContactDetails = () => {
		dispatch(setState({ isContactDetailsVisible: false }));
	};

	useEffect(() => {
		if (contactData?.wa_id) {
			retrieveContactData(contactData.wa_id);
		}
		setChat(findChatByWaId());
	}, []);

	const findChatByWaId = () => {
		const waId = contactData?.wa_id;
		return chats[CHAT_KEY_PREFIX + waId];
	};

	return (
		<SidePanel
			className="z-10"
			title={t('Contact Details')}
			onClose={hideContactDetails}
			isExiting={isExiting}
			onAnimationEnd={onAnimationEnd}
		>
			{contactData && (
				<div className="relative flex flex-1 flex-col overflow-y-auto bg-gray-light">
					<ProfileSection>
						<div className="flex justify-center">
							<CustomAvatar
								src={extractAvatarFromContactProviderData(
									contactProvidersData[contactData.wa_id ?? ''],
									true
								)}
								className="mb-3.75 size-50 text-[5rem]/none"
								generateBgColorBy={contactData.waba_payload?.profile?.name}
							>
								{contactData.initials}
							</CustomAvatar>
						</div>

						<PrintMessage
							as="h3"
							className="text-center text-[20px] font-semibold [&_.emoji-mart-emoji]:size-5!"
							message={
								contactProvidersData[contactData.wa_id ?? '']?.[0]?.name ??
								contactData.waba_payload?.profile?.name
							}
						/>

						{contactProvidersData[contactData.wa_id ?? '']?.[0]
							?.companies?.[0] !== undefined && (
							<div className="mb-2.5 text-center text-[14px] font-semibold text-ink/40">
								<span>
									{
										contactProvidersData[contactData.wa_id ?? '']?.[0]
											?.companies?.[0]?.job_title
									}
								</span>{' '}
								at{' '}
								<span>
									{
										contactProvidersData[contactData.wa_id ?? '']?.[0]
											?.companies?.[0]?.company_name
									}
								</span>
							</div>
						)}

						<div className="text-center text-[14px]">
							Last message:{' '}
							{contactData.last_message_timestamp &&
							contactData.last_message_timestamp > 0 ? (
								<Moment unix calendar={CALENDAR_NORMAL}>
									{contactData.last_message_timestamp}
								</Moment>
							) : (
								t('Never')
							)}
						</div>

						{currentChatTags && currentChatTags.length > 0 && (
							<div className="mt-3">
								{currentChatTags.map((tag, index) => (
									<div
										className="mr-2.5 inline-block cursor-pointer"
										key={index}
										onClick={() => dispatch(setFilterTagId(tag.id))}
									>
										<SellIcon
											className="mr-1.25 align-baseline"
											style={{ fill: tag.web_inbox_color }}
										/>
										<span className="bold inline-block max-w-[150px] truncate">
											{tag.name}
										</span>
									</div>
								))}
							</div>
						)}

						{(chat?.assigned_to_user || chat?.assigned_group) && (
							<div className="mt-3 rounded-[10px] border-2 border-gray-light px-2.5 py-1.25 text-[14px]">
								{chat?.assigned_to_user && (
									<div className="py-1.25">
										<PersonIcon className={assigneeIconClassName} />
										<Trans
											values={{
												postProcess: 'sprintf',
												sprintf: [chat?.assigned_to_user.username],
											}}
										>
											Assigned to: <span className="bold">%s</span>
										</Trans>
									</div>
								)}

								{chat?.assigned_group && (
									<div className="py-1.25">
										<GroupIcon className={assigneeIconClassName} />
										<Trans
											values={{
												postProcess: 'sprintf',
												sprintf: [chat?.assigned_group.name],
											}}
										>
											Assigned group: <span className="bold">%s</span>
										</Trans>
									</div>
								)}
							</div>
						)}
					</ProfileSection>

					{!isUserActionsRestricted && isPhoneNumber(contactData.wa_id) && (
						<ProfileSection>
							<div className="text-[16px]">{t('WhatsApp Phone Number')}</div>
							<a className="text-light-blue" href={'tel:+' + contactData.wa_id}>
								{addPlus(contactData.wa_id)}
							</a>
						</ProfileSection>
					)}

					{!isUserActionsRestricted &&
						contactProvidersData[contactData.wa_id ?? '']?.map(
							(providerData: any, index: number) => (
								<ProfileSection
									key={index + '_' + providerData.contact_provider.id}
								>
									<div className="text-[16px]">
										<div className="mb-3 inline-block rounded-[16px] bg-gray-light px-2.5 py-1.25 text-ink/80 [&_img]:mr-1 [&_img]:size-4 [&_img]:align-middle">
											{providerData.contact_provider.type === 'google' && (
												<img
													src={googleLogo}
													alt={providerData.contact_provider.name}
												/>
											)}
											{providerData.contact_provider.type === 'hubspot' && (
												<img
													src={hubspotLogo}
													alt={providerData.contact_provider.name}
												/>
											)}
											{providerData.contact_provider.name ??
												providerData.contact_provider.type}
										</div>
									</div>

									<div className="mb-2">
										<div className="text-[14px]">{t('Phone number')}</div>
										<div className="text-[14px] text-ink/60">
											{providerData.phone_numbers?.map(
												(phoneNumber: any, phoneNumberIndex: number) => (
													<div key={phoneNumberIndex}>
														<a
															className="text-light-blue"
															href={'tel:' + addPlus(phoneNumber.phone_number)}
														>
															<span>{addPlus(phoneNumber.phone_number)}</span>
														</a>
														{phoneNumber.description && (
															<span className="ml-1.25">
																({phoneNumber.description})
															</span>
														)}
													</div>
												)
											)}
										</div>
									</div>

									{Boolean(providerData.email_addresses?.length ?? 0 > 0) && (
										<div className="mb-2">
											<div className="text-[14px]">{t('E-mail')}</div>
											<div className="text-[14px] text-ink/60">
												{providerData.email_addresses?.map(
													(emailAddress: any, emailAddressIndex: number) => (
														<div key={emailAddressIndex}>
															<a
																className="text-light-blue"
																href={'mailto:' + emailAddress.email_address}
															>
																{emailAddress.email_address}
															</a>
															{emailAddress.description && (
																<span className="ml-1.25">
																	({emailAddress.description})
																</span>
															)}
														</div>
													)
												)}
											</div>
										</div>
									)}
								</ProfileSection>
							)
						)}
				</div>
			)}
		</SidePanel>
	);
};

export default ContactDetails;
