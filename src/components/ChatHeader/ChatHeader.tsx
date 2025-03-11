import React, { MouseEvent, useState } from 'react';
import '../../styles/ChatHeader.css';
import {
	Divider,
	IconButton,
	ListItemIcon,
	Menu,
	MenuItem,
	Tooltip,
} from '@mui/material';
import { ArrowBack, MoreVert, Search } from '@mui/icons-material';
import { EVENT_TOPIC_FORCE_REFRESH_CHAT } from '@src/Constants';
import PubSub from 'pubsub-js';
import { extractAvatarFromContactProviderData } from '@src/helpers/Helpers';
import { addPlus } from '@src/helpers/PhoneNumberHelper';
import WarningIcon from '@mui/icons-material/Warning';
import { isMobileOnly } from 'react-device-detect';
import {
	getDisplayAssignmentAndTaggingHistory,
	setDisplayAssignmentAndTaggingHistory,
} from '@src/helpers/StorageHelper';
import { useTranslation } from 'react-i18next';
import PrintMessage from '../PrintMessage';
import CustomAvatar from '@src/components/CustomAvatar';
import AssigneeChip from '@src/components/AssigneeChip';
import styles from './ChatHeader.module.css';
import useChatAssignmentAPI from '@src/hooks/api/useChatAssignmentAPI';
import classNames from 'classnames/bind';
import PersonModel from '@src/api/models/PersonModel';
import ChatModel from '@src/api/models/ChatModel';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SellIcon from '@mui/icons-material/Sell';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import {
	setContactDetailsVisible,
	setSearchMessagesVisible,
} from '@src/store/reducers/UIReducer';

const cx = classNames.bind(styles);

interface Props {
	chat?: ChatModel;
	person?: PersonModel;
	contactProvidersData: { [key: string]: any };
	isChatOnly: boolean | Number;
	setChatAssignmentVisible: (isVisible: boolean) => void;
	setChatTagsVisible: (isVisible: boolean) => void;
	closeChat: () => void;
	hasFailedMessages: boolean;
	waId: string;
}

const ChatHeader: React.FC<Props> = ({
	chat,
	person,
	contactProvidersData,
	isChatOnly,
	setChatAssignmentVisible,
	setChatTagsVisible,
	closeChat,
	hasFailedMessages,
	waId,
}) => {
	const dispatch = useAppDispatch();

	const { isReadOnly } = useAppSelector((state) => state.UI);

	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = useState<Element>();

	const { partialUpdateChatAssignment } = useChatAssignmentAPI();

	const displayMenu = (event: MouseEvent) => {
		if (event.currentTarget instanceof Element) {
			setAnchorEl(event.currentTarget);
		}
	};

	const hideMenu = () => {
		setAnchorEl(undefined);
	};

	const showSearchMessages = () => {
		dispatch(setSearchMessagesVisible(true));
	};

	const showContactDetails = () => {
		dispatch(setContactDetailsVisible(true));
	};

	const showContactDetailsAndHideMenu = () => {
		showContactDetails();
		hideMenu();
	};

	const showChatAssignmentAndHideMenu = () => {
		setChatAssignmentVisible(true);
		hideMenu();
	};

	const showChatTagsAndHideMenu = () => {
		setChatTagsVisible(true);
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

	const closeChatAndHideMenu = () => {
		closeChat();
		hideMenu();
	};

	return (
		<div className="chat__header" onDrop={(event) => event.preventDefault()}>
			{!isChatOnly && (
				<div className="mobileOnly">
					<IconButton
						className="chat__header__backButton"
						onClick={closeChat}
						size="large"
					>
						<ArrowBack />
					</IconButton>
				</div>
			)}

			<div className="chat__header__clickable" onClick={showContactDetails}>
				<CustomAvatar
					src={extractAvatarFromContactProviderData(contactProvidersData[waId])}
					className={
						'chat__header__avatar ' + (person?.isExpired ? 'expired' : '')
					}
					generateBgColorBy={!person?.isExpired ? person?.name : undefined}
				>
					{person?.initials}
				</CustomAvatar>

				<div className="chat__headerInfo">
					<PrintMessage
						as="h3"
						message={
							contactProvidersData[waId]?.[0]?.name ??
							person?.name ??
							(person?.waId ? addPlus(person?.waId) : '')
						}
					/>

					{/*<p><Moment date={contact?.lastMessageTimestamp} format={dateFormat} unix /></p>*/}

					<div className={styles.subRow}>
						<span
							className={cx({
								waId: true,
								desktopOnly: true,
							})}
						>
							{person?.waId ? addPlus(person?.waId) : ''}
						</span>

						{person?.isExpired && (
							<span className={styles.expiredIndicator}>{t('Expired')}</span>
						)}
					</div>
				</div>
			</div>

			<div className="chat__headerRight">
				{chat && (
					<div className={styles.assigneeActions}>
						<AssigneeChip
							assigneeType="user"
							name={chat.assignedToUser?.username}
							secondaryName={chat.assignedGroup?.name}
							assignedUserId={chat.assignedToUser?.id}
							assignedGroupId={chat.assignedGroup?.id}
							isActionable={!isReadOnly}
							onAction={(userId, groupId) => {
								partialUpdateChatAssignment(waId, userId, groupId);
							}}
						/>
					</div>
				)}

				{isMobileOnly && hasFailedMessages && (
					<Tooltip
						title={t('Failed to send some messages!')}
						disableInteractive
					>
						<IconButton onClick={closeChat} size="large">
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
				open={Boolean(anchorEl)}
				onClose={hideMenu}
				elevation={3}
			>
				<MenuItem onClick={showContactDetailsAndHideMenu}>
					<ListItemIcon>
						<AccountBoxIcon />
					</ListItemIcon>
					{t('Contact details')}
				</MenuItem>
				{!isReadOnly && <Divider />}
				{!isReadOnly && (
					<MenuItem onClick={showChatAssignmentAndHideMenu}>
						<ListItemIcon>
							<AssignmentTurnedInIcon />
						</ListItemIcon>
						{t('Assign chat')}
					</MenuItem>
				)}
				{!isReadOnly && (
					<MenuItem onClick={showChatTagsAndHideMenu}>
						<ListItemIcon>
							<SellIcon />
						</ListItemIcon>
						{t('Change tags')}
					</MenuItem>
				)}
				<Divider />
				<MenuItem onClick={toggleAssignmentAndTaggingHistory}>
					<ListItemIcon>
						<EventNoteIcon />
					</ListItemIcon>
					{t('Toggle event history')}
				</MenuItem>
				<Divider />
				<MenuItem onClick={closeChatAndHideMenu}>
					<ListItemIcon>
						<CloseIcon />
					</ListItemIcon>
					{t('Close view')}
				</MenuItem>
			</Menu>
		</div>
	);
};

export default ChatHeader;
