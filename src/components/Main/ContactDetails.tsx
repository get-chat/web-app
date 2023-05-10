// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import PubSub from 'pubsub-js';
import {
	CALENDAR_NORMAL,
	CHAT_KEY_PREFIX,
	EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY,
} from '@src/Constants';
import '../../styles/ContactDetails.css';
import Moment from 'react-moment';
import googleLogo from '../../assets/images/ic-google.png';
import hubspotLogo from '../../assets/images/ic-hubspot.png';
import { extractAvatarFromContactProviderData } from '@src/helpers/Helpers';
import { addPlus } from '@src/helpers/PhoneNumberHelper';
import { Trans, useTranslation } from 'react-i18next';
import PrintMessage from '../PrintMessage';
import { setFilterTag } from '@src/store/reducers/filterTagReducer';
import CustomAvatar from '@src/components/CustomAvatar';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import SellIcon from '@mui/icons-material/Sell';

const ContactDetails: React.FC = ({
	contactData,
	contactProvidersData,
	retrieveContactData,
}) => {
	const { t } = useTranslation();

	const chats = useAppSelector((state) => state.chats.value);

	const [chat, setChat] = useState({});

	const dispatch = useAppDispatch();

	const hideContactDetails = () => {
		PubSub.publish(EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, false);
	};

	useEffect(() => {
		retrieveContactData(contactData?.waId);
		setChat(findChatByWaId());
	}, []);

	// TODO: Load chat via API instead as it might not be loaded yet in chat list
	const findChatByWaId = () => {
		const waId = contactData?.waId;
		return chats[CHAT_KEY_PREFIX + waId];
	};

	return (
		<div className="contactDetails">
			<div className="contactDetails__header">
				<IconButton onClick={hideContactDetails} size="large">
					<CloseIcon />
				</IconButton>

				<h3>{t('Contact Details')}</h3>
			</div>

			{contactData && (
				<div className="contactDetails__body">
					<div className="contactDetails__body__section">
						<div className="contactDetails__body__avatarContainer">
							<CustomAvatar
								src={extractAvatarFromContactProviderData(
									contactProvidersData[contactData.waId],
									true
								)}
								className="contactDetails__body__avatar"
								generateBgColorBy={contactData.name}
							>
								{contactData.initials}
							</CustomAvatar>
						</div>

						<PrintMessage
							as="h3"
							message={
								contactProvidersData[contactData.waId]?.[0]?.name ??
								contactData.name
							}
						/>

						{contactProvidersData[contactData.waId]?.[0]?.companies?.[0] !==
							undefined && (
							<div className="contactDetails__body__job">
								<span>
									{
										contactProvidersData[contactData.waId]?.[0]?.companies?.[0]
											?.job_title
									}
								</span>{' '}
								at{' '}
								<span>
									{
										contactProvidersData[contactData.waId]?.[0]?.companies?.[0]
											?.company_name
									}
								</span>
							</div>
						)}

						<div className="contactDetails__body__lastMessageAt">
							Last message:{' '}
							{contactData.lastMessageTimestamp &&
							contactData.lastMessageTimestamp > 0 ? (
								<Moment unix calendar={CALENDAR_NORMAL}>
									{contactData.lastMessageTimestamp}
								</Moment>
							) : (
								t('Never')
							)}
						</div>

						{chat?.tags?.length > 0 && (
							<div className="contactDetails__body__tags mt-3">
								{chat?.tags.map((tag, index) => (
									<div
										className="contactDetails__body__tags__tag"
										key={index}
										onClick={() => dispatch(setFilterTag(tag))}
									>
										<SellIcon
											style={{
												fill: tag.web_inbox_color,
											}}
										/>
										<span className="bold">{tag.name}</span>
									</div>
								))}
							</div>
						)}

						{(chat?.assignedToUser || chat?.assignedGroup) && (
							<div className="contactDetails__body__assignees mt-3">
								{chat?.assignedToUser && (
									<div>
										<PersonIcon />
										<Trans
											values={{
												postProcess: 'sprintf',
												sprintf: [chat?.assignedToUser.username],
											}}
										>
											Assigned to: <span className="bold">%s</span>
										</Trans>
									</div>
								)}

								{chat?.assignedGroup && (
									<div>
										<GroupIcon />
										<Trans
											values={{
												postProcess: 'sprintf',
												sprintf: [chat?.assignedGroup.name],
											}}
										>
											Assigned group: <span className="bold">%s</span>
										</Trans>
									</div>
								)}
							</div>
						)}
					</div>

					<div className="contactDetails__body__section">
						<div className="contactDetails__body__section__title">
							{t('WhatsApp Phone Number')}
						</div>
						<a href={'tel:+' + contactData.waId}>{addPlus(contactData.waId)}</a>
					</div>

					{contactProvidersData[contactData.waId]?.map(
						(providerData, index) => (
							<div
								className="contactDetails__body__section"
								key={providerData.contact_provider.id}
							>
								<div className="contactDetails__body__section__title mb-3">
									<div className="contactDetails__body__section__providerTitle">
										{providerData.contact_provider.type === 'google' && (
											<img
												className="mr-1"
												src={googleLogo}
												alt={providerData.contact_provider.name}
											/>
										)}
										{providerData.contact_provider.type === 'hubspot' && (
											<img
												className="mr-1"
												src={hubspotLogo}
												alt={providerData.contact_provider.name}
											/>
										)}
										{providerData.contact_provider.name}
									</div>
								</div>

								<div className="contactDetails__body__section__content mb-2">
									<div className="contactDetails__body__section__subtitle">
										{t('Phone number')}
									</div>
									<div className="contactDetails__body__section__content__sub">
										{providerData.phone_numbers?.map(
											(phoneNumber, phoneNumberIndex) => (
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
									</div>
								</div>

								<div className="contactDetails__body__section__content">
									<div className="contactDetails__body__section__subtitle">
										{t('E-mail')}
									</div>
									<div className="contactDetails__body__section__content__sub">
										{providerData.email_addresses?.map(
											(emailAddress, emailAddressIndex) => (
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
									</div>
								</div>
							</div>
						)
					)}
				</div>
			)}
		</div>
	);
};

export default ContactDetails;
