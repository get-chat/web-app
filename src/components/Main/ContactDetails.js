import React, { useEffect, useState } from 'react';
import { Avatar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';
import PubSub from 'pubsub-js';
import {
	CALENDAR_NORMAL,
	CHAT_KEY_PREFIX,
	EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY,
} from '../../Constants';
import '../../styles/ContactDetails.css';
import Moment from 'react-moment';
import googleLogo from '../../assets/images/ic-google.png';
import hubspotLogo from '../../assets/images/ic-hubspot.png';
import { extractAvatarFromContactProviderData } from '../../helpers/Helpers';
import LabelIcon from '@material-ui/icons/Label';
import { generateAvatarColor } from '../../helpers/AvatarHelper';
import { addPlus } from '../../helpers/PhoneNumberHelper';
import { Trans, useTranslation } from 'react-i18next';
import PrintMessage from '../PrintMessage';

function ContactDetails(props) {
	const { t } = useTranslation();

	const [chat, setChat] = useState({});

	const hideContactDetails = () => {
		PubSub.publish(EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, false);
	};

	useEffect(() => {
		props.retrieveContactData(props.contactData?.waId);
		setChat(findChatByWaId());
	}, []);

	const findChatByWaId = () => {
		const waId = props.contactData?.waId;
		return props.chats[CHAT_KEY_PREFIX + waId];
	};

	return (
		<div className="contactDetails">
			<div className="contactDetails__header">
				<IconButton onClick={hideContactDetails}>
					<CloseIcon />
				</IconButton>

				<h3>{t('Contact Details')}</h3>
			</div>

			{props.contactData && (
				<div className="contactDetails__body">
					<div className="contactDetails__body__section">
						<div className="contactDetails__body__avatarContainer">
							<Avatar
								src={extractAvatarFromContactProviderData(
									props.contactProvidersData[props.contactData.waId],
									true
								)}
								className="contactDetails__body__avatar"
								style={{
									backgroundColor: generateAvatarColor(props.contactData.name),
								}}
							>
								{props.contactData.initials}
							</Avatar>
						</div>

						<PrintMessage
							as="h3"
							message={
								props.contactProvidersData[props.contactData.waId]?.[0]?.name ??
								props.contactData.name
							}
						/>

						{props.contactProvidersData[props.contactData.waId]?.[0]
							?.companies?.[0] !== undefined && (
							<div className="contactDetails__body__job">
								<span>
									{
										props.contactProvidersData[props.contactData.waId]?.[0]
											?.companies?.[0]?.job_title
									}
								</span>{' '}
								at{' '}
								<span>
									{
										props.contactProvidersData[props.contactData.waId]?.[0]
											?.companies?.[0]?.company_name
									}
								</span>
							</div>
						)}

						<div className="contactDetails__body__lastMessageAt">
							Last message:{' '}
							{props.contactData.lastMessageTimestamp &&
							props.contactData.lastMessageTimestamp > 0 ? (
								<Moment unix calendar={CALENDAR_NORMAL}>
									{props.contactData.lastMessageTimestamp}
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
										onClick={() => props.setFilterTag(tag)}
									>
										<LabelIcon
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
							{t('Whatsapp Phone Number')}
						</div>
						<a href={'tel:+' + props.contactData.waId}>
							{addPlus(props.contactData.waId)}
						</a>
					</div>

					{props.contactProvidersData[props.contactData.waId]?.map(
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
}

export default ContactDetails;
