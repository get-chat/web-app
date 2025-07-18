import React, { useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import { CALENDAR_NORMAL, CHAT_KEY_PREFIX } from '@src/Constants';
import * as Styled from './ContactDetails.styles';
import Moment from 'react-moment';
// @ts-ignore
import googleLogo from '../../../assets/images/ic-google.png';
// @ts-ignore
import hubspotLogo from '../../../assets/images/ic-hubspot.png';
import { extractAvatarFromContactProviderData } from '@src/helpers/Helpers';
import { addPlus } from '@src/helpers/PhoneNumberHelper';
import { Trans, useTranslation } from 'react-i18next';
import { setFilterTagId } from '@src/store/reducers/filterTagIdReducer';
import CustomAvatar from '@src/components/CustomAvatar';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import SellIcon from '@mui/icons-material/Sell';
import { setState } from '@src/store/reducers/UIReducer';
import { Chat } from '@src/types/chats';
import PrintMessage from '@src/components/PrintMessage';

interface Props {
	contactProvidersData: { [key: string]: any };
	retrieveContactData: (personWaId: string, onComplete?: () => void) => void;
}

const ContactDetails: React.FC<Props> = ({
	contactProvidersData,
	retrieveContactData,
}) => {
	const { t } = useTranslation();

	const chats = useAppSelector((state) => state.chats.value);
	const { chosenContact: contactData } = useAppSelector((state) => state.UI);
	const currentChatTags = useAppSelector(
		(state) => state.currentChatTags.value
	);

	const [chat, setChat] = useState<Chat>();

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
		<Styled.ContactDetailsContainer>
			<Styled.Header>
				<IconButton onClick={hideContactDetails} size="large">
					<CloseIcon />
				</IconButton>
				<h3>{t('Contact Details')}</h3>
			</Styled.Header>

			{contactData && (
				<Styled.Body>
					<Styled.Section>
						<Styled.AvatarContainer>
							<CustomAvatar
								src={extractAvatarFromContactProviderData(
									contactProvidersData[contactData.wa_id ?? ''],
									true
								)}
								style={{
									height: '200px',
									width: '200px',
									fontSize: '5rem',
									marginBottom: '15px',
								}}
								generateBgColorBy={contactData.waba_payload?.profile?.name}
							>
								{contactData.initials}
							</CustomAvatar>
						</Styled.AvatarContainer>

						<PrintMessage
							as="h3"
							message={
								contactProvidersData[contactData.wa_id ?? '']?.[0]?.name ??
								contactData.waba_payload?.profile?.name
							}
						/>

						{contactProvidersData[contactData.wa_id ?? '']?.[0]
							?.companies?.[0] !== undefined && (
							<Styled.JobInfo>
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
							</Styled.JobInfo>
						)}

						<Styled.LastMessageAt>
							Last message:{' '}
							{contactData.last_message_timestamp &&
							contactData.last_message_timestamp > 0 ? (
								<Moment unix calendar={CALENDAR_NORMAL}>
									{contactData.last_message_timestamp}
								</Moment>
							) : (
								t('Never')
							)}
						</Styled.LastMessageAt>

						{currentChatTags && currentChatTags.length > 0 && (
							<Styled.TagsContainer>
								{currentChatTags.map((tag, index) => (
									<Styled.Tag
										key={index}
										onClick={() => dispatch(setFilterTagId(tag.id))}
									>
										<SellIcon style={{ fill: tag.web_inbox_color }} />
										<span className="bold">{tag.name}</span>
									</Styled.Tag>
								))}
							</Styled.TagsContainer>
						)}

						{(chat?.assigned_to_user || chat?.assigned_group) && (
							<Styled.AssigneesContainer>
								{chat?.assigned_to_user && (
									<div>
										<PersonIcon />
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
									<div>
										<GroupIcon />
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
							</Styled.AssigneesContainer>
						)}
					</Styled.Section>

					<Styled.Section>
						<Styled.SectionTitle>
							{t('WhatsApp Phone Number')}
						</Styled.SectionTitle>
						<a href={'tel:+' + contactData.wa_id}>
							{addPlus(contactData.wa_id)}
						</a>
					</Styled.Section>

					{contactProvidersData[contactData.wa_id ?? '']?.map(
						(providerData: any, index: number) => (
							<Styled.Section
								key={index + '_' + providerData.contact_provider.id}
							>
								<Styled.SectionTitle>
									<Styled.ProviderTitle>
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
									</Styled.ProviderTitle>
								</Styled.SectionTitle>

								<Styled.Content>
									<Styled.Subtitle>{t('Phone number')}</Styled.Subtitle>
									<Styled.ContentSub>
										{providerData.phone_numbers?.map(
											(phoneNumber: any, phoneNumberIndex: number) => (
												<div key={phoneNumberIndex}>
													<a href={'tel:' + addPlus(phoneNumber.phone_number)}>
														<span>{addPlus(phoneNumber.phone_number)}</span>
													</a>
													{phoneNumber.description && (
														<span className="ml-1">
															({phoneNumber.description})
														</span>
													)}
												</div>
											)
										)}
									</Styled.ContentSub>
								</Styled.Content>

								{Boolean(providerData.email_addresses?.length ?? 0 > 0) && (
									<Styled.Content>
										<Styled.Subtitle>{t('E-mail')}</Styled.Subtitle>
										<Styled.ContentSub>
											{providerData.email_addresses?.map(
												(emailAddress: any, emailAddressIndex: number) => (
													<div key={emailAddressIndex}>
														<a href={'mailto:' + emailAddress.email_address}>
															{emailAddress.email_address}
														</a>
														{emailAddress.description && (
															<span className="ml-1">
																({emailAddress.description})
															</span>
														)}
													</div>
												)
											)}
										</Styled.ContentSub>
									</Styled.Content>
								)}
							</Styled.Section>
						)
					)}
				</Styled.Body>
			)}
		</Styled.ContactDetailsContainer>
	);
};

export default ContactDetails;
