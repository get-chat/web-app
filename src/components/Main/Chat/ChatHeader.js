import React, { useState } from 'react';
import '../../../styles/ChatHeader.css';
import { Divider, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { ArrowBack, MoreVert, Search } from '@mui/icons-material';
import {
	EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY,
	EVENT_TOPIC_FORCE_REFRESH_CHAT,
	EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY,
} from '@src/Constants';
import PubSub from 'pubsub-js';
import { extractAvatarFromContactProviderData } from '@src/helpers/Helpers';
import { generateAvatarColor } from '@src/helpers/AvatarHelper';
import { addPlus } from '@src/helpers/PhoneNumberHelper';
import WarningIcon from '@mui/icons-material/Warning';
import { isMobileOnly } from 'react-device-detect';
import {
	getDisplayAssignmentAndTaggingHistory,
	setDisplayAssignmentAndTaggingHistory,
} from '@src/helpers/StorageHelper';
import { useTranslation } from 'react-i18next';
import PrintMessage from '../../PrintMessage';
import CustomAvatar from '@src/components/CustomAvatar';

function ChatHeader(props) {
	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = useState(null);

	const displayMenu = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const hideMenu = () => {
		setAnchorEl(null);
	};

	const showSearchMessages = () => {
		PubSub.publish(EVENT_TOPIC_SEARCH_MESSAGES_VISIBILITY, true);
	};

	const showContactDetails = () => {
		PubSub.publish(EVENT_TOPIC_CONTACT_DETAILS_VISIBILITY, true);
	};

	const showContactDetailsAndHideMenu = () => {
		showContactDetails();
		hideMenu();
	};

	const showChatAssignmentAndHideMenu = () => {
		props.setChatAssignmentVisible(true);
		hideMenu();
	};

	const showChatTagsAndHideMenu = () => {
		props.setChatTagsVisible(true);
		hideMenu();
	};

	const toggleAssignmentAndTaggingHistory = () => {
		setDisplayAssignmentAndTaggingHistory(
			!getDisplayAssignmentAndTaggingHistory()
		);
		hideMenu();

		// Force refresh chat
		PubSub.publish(EVENT_TOPIC_FORCE_REFRESH_CHAT, true);
	};

	return (
		<div className="chat__header" onDrop={(event) => event.preventDefault()}>
			{!props.isChatOnly && (
				<div className="mobileOnly">
					<IconButton
						className="chat__header__backButton"
						onClick={props.closeChat}
						size="large"
					>
						<ArrowBack />
					</IconButton>
				</div>
			)}

			<div className="chat__header__clickable" onClick={showContactDetails}>
				<CustomAvatar
					src={extractAvatarFromContactProviderData(
						props.contactProvidersData[props.person?.waId]
					)}
					className={
						'chat__header__avatar ' + (props.person?.isExpired ? 'expired' : '')
					}
					style={
						props.person?.isExpired
							? {}
							: {
									backgroundColor: generateAvatarColor(props.person?.name),
							  }
					}
				>
					{props.person?.initials}
				</CustomAvatar>

				<div className="chat__headerInfo">
					<PrintMessage
						as="h3"
						message={
							props.contactProvidersData[props.person?.waId]?.[0]?.name ??
							props.person?.name ??
							(props.person?.waId ? addPlus(props.person?.waId) : '')
						}
					/>

					{/*<p><Moment date={contact?.lastMessageTimestamp} format={dateFormat} unix /></p>*/}
					{props.person?.isExpired && (
						<p className="chat__header__expired">{t('Inactive')}</p>
					)}
				</div>

				<div className="chat__headerInfo_2">
					<span className="chat__headerInfo_2__waId desktopOnly">
						{props.person?.waId ? addPlus(props.person?.waId) : ''}
					</span>
				</div>
			</div>

			<div className="chat__headerRight">
				{isMobileOnly && props.hasFailedMessages && (
					<Tooltip title={t('Failed to send some messages!')}>
						<IconButton onClick={props.closeChat} size="large">
							<WarningIcon className="error" />
						</IconButton>
					</Tooltip>
				)}
				<IconButton onClick={showSearchMessages} size="large">
					<Search />
				</IconButton>
				<IconButton onClick={displayMenu} size="large">
					<MoreVert />
				</IconButton>
			</div>

			<Menu
				anchorEl={anchorEl}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={hideMenu}
				elevation={3}
			>
				<MenuItem onClick={showContactDetailsAndHideMenu}>
					{t('Contact details')}
				</MenuItem>
				<MenuItem onClick={showChatAssignmentAndHideMenu}>
					{t('Assign chat')}
				</MenuItem>
				<MenuItem onClick={showChatTagsAndHideMenu}>
					{t('Change tags')}
				</MenuItem>
				<Divider />
				<MenuItem onClick={toggleAssignmentAndTaggingHistory}>
					{t('Toggle assignment and tagging history')}
				</MenuItem>
			</Menu>
		</div>
	);
}

export default ChatHeader;
