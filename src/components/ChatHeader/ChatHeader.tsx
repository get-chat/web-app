import React, { MouseEvent, useState } from 'react';
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
import AssigneeChip from '@src/components/AssigneeChip';
import useChatAssignmentAPI from '@src/hooks/api/useChatAssignmentAPI';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SellIcon from '@mui/icons-material/Sell';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setState } from '@src/store/reducers/UIReducer';
import { Chat } from '@src/types/chats';
import * as Styled from './ChatHeader.styles';
import { Person } from '@src/types/persons';
import { isPersonExpired } from '@src/helpers/PersonHelper';

interface Props {
	chat?: Chat;
	person?: Person;
	contactProvidersData: { [key: string]: any };
	isChatOnly: boolean | Number;
	setChatTagsVisible: (isVisible: boolean) => void;
	closeChat: () => void;
	waId: string;
}

const ChatHeader: React.FC<Props> = ({
	chat,
	person,
	contactProvidersData,
	isChatOnly,
	setChatTagsVisible,
	closeChat,
	waId,
}) => {
	const dispatch = useAppDispatch();

	const { isReadOnly, hasFailedMessages } = useAppSelector((state) => state.UI);

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
		dispatch(setState({ isSearchMessagesVisible: true }));
	};

	const showContactDetails = () => {
		dispatch(setState({ isContactDetailsVisible: true }));
	};

	const showContactDetailsAndHideMenu = () => {
		showContactDetails();
		hideMenu();
	};

	const showChatAssignmentAndHideMenu = () => {
		dispatch(setState({ isChatAssignmentVisible: true }));
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
		<Styled.Header onDrop={(event) => event.preventDefault()}>
			{!isChatOnly && (
				<Styled.MobileOnly>
					<Styled.BackButton onClick={closeChat} size="large">
						<ArrowBack />
					</Styled.BackButton>
				</Styled.MobileOnly>
			)}

			<Styled.Clickable onClick={showContactDetails}>
				<Styled.Avatar
					src={extractAvatarFromContactProviderData(contactProvidersData[waId])}
					$isExpired={isPersonExpired(person)}
					generateBgColorBy={
						!isPersonExpired(person)
							? person?.waba_payload?.profile?.name
							: undefined
					}
				>
					{person?.initials}
				</Styled.Avatar>

				<Styled.HeaderInfo>
					<PrintMessage
						as="h3"
						message={
							contactProvidersData[waId]?.[0]?.name ??
							person?.waba_payload?.profile?.name ??
							(person?.wa_id ? addPlus(person?.wa_id) : '')
						}
					/>

					<Styled.SubRow>
						<Styled.WaId $desktopOnly>
							{person?.wa_id ? addPlus(person?.wa_id) : ''}
						</Styled.WaId>

						{isPersonExpired(person) && (
							<Styled.ExpiredIndicator>{t('Expired')}</Styled.ExpiredIndicator>
						)}
					</Styled.SubRow>
				</Styled.HeaderInfo>
			</Styled.Clickable>

			<Styled.HeaderRight>
				{chat && (
					<Styled.AssigneeActions>
						<AssigneeChip
							assigneeType="user"
							name={chat.assigned_to_user?.username}
							secondaryName={chat.assigned_group?.name}
							assignedUserId={chat.assigned_to_user?.id}
							assignedGroupId={chat.assigned_group?.id}
							isActionable={!isReadOnly}
							onAction={(userId, groupId) => {
								partialUpdateChatAssignment(waId, userId, groupId);
							}}
						/>
					</Styled.AssigneeActions>
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
			</Styled.HeaderRight>

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
					{t('ContactView details')}
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
		</Styled.Header>
	);
};

export default ChatHeader;
