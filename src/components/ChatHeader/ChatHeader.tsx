import React, { useContext, useEffect, useState } from 'react';
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
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import SellIcon from '@mui/icons-material/SellOutlined';
import EventNoteIcon from '@mui/icons-material/EventNoteOutlined';
import AccountBoxIcon from '@mui/icons-material/AccountBoxOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestoreOutlined';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setState } from '@src/store/reducers/UIReducer';
import { Chat } from '@src/types/chats';
import { Person } from '@src/types/persons';
import { isPersonExpired } from '@src/helpers/PersonHelper';
import TagsChip from '@src/components/TagsChip';
import { AxiosError } from 'axios';
import { updateResolved } from '@src/api/chatsApi';
import DoneIcon from '@mui/icons-material/DoneOutlined';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { useIsUserActionsRestricted } from '@src/hooks/useIsUserActionsRestricted';
import CustomAvatar from '@src/components/CustomAvatar';
import { Button } from '@src/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@src/components/ui/dropdown-menu';
import { Skeleton } from '@src/components/ui/skeleton';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@src/components/ui/tooltip';
import { cn } from '@src/lib/utils';

// Brown header icons; `!` because App.css colours every MUI icon grey
const headerIconButton = 'text-black/54 [&_svg]:text-chat-icon!';

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
	const config = useContext(AppConfigContext);

	const dispatch = useAppDispatch();

	const { isReadOnly, hasFailedMessages } = useAppSelector((state) => state.UI);

	const isUserActionsRestricted = useIsUserActionsRestricted();

	const { t } = useTranslation();

	const [isResolved, setIsResolved] = useState(false);

	useEffect(() => {
		setIsResolved(chat?.contact?.resolved ?? false);
	}, [chat]);

	const { partialUpdateChatAssignment } = useChatAssignmentAPI();

	const showSearchMessages = () => {
		dispatch(setState({ isSearchMessagesVisible: true }));
	};

	const showContactDetails = () => {
		dispatch(setState({ isContactDetailsVisible: true }));
	};

	const showChatAssignment = () => {
		dispatch(setState({ isChatAssignmentVisible: true }));
	};

	const showChatTags = () => {
		setChatTagsVisible(true);
	};

	const toggleAssignmentAndTaggingHistory = () => {
		setDisplayAssignmentAndTaggingHistory(
			!getDisplayAssignmentAndTaggingHistory()
		);

		// Force refresh chat
		PubSub.publish(EVENT_TOPIC_FORCE_REFRESH_CHAT, true);
	};

	const updateResolvedCall = async (resolved: boolean) => {
		try {
			const data = await updateResolved(waId, {
				resolved: resolved,
			});
			setIsResolved(data.resolved);
		} catch (error: any | AxiosError) {
			console.error(error);
		}
	};

	return (
		<div
			className="flex h-(--header-height) items-center border-l border-[lightgray] bg-[#6843301f] px-[15px] max-[750px]:z-1 max-[750px]:border-l-0 max-[750px]:px-2.5 max-[750px]:py-1 max-[750px]:shadow-[0_4px_5px_-6px_rgba(0,0,45,0.4)]"
			onDrop={(event) => event.preventDefault()}
		>
			{!isChatOnly && (
				<div className="min-[501px]:hidden">
					<Button
						variant="ghost"
						size="icon-xl"
						className={cn(headerIconButton, 'mr-[5px]')}
						onClick={closeChat}
					>
						<ArrowBack />
					</Button>
				</div>
			)}

			<div
				className={cn(
					'flex flex-1 items-center overflow-hidden text-ellipsis whitespace-nowrap',
					person && 'cursor-pointer'
				)}
				onClick={person ? showContactDetails : undefined}
			>
				{!person ? (
					<>
						<Skeleton variant="circular" className="size-10" />
						<div className="pl-[15px]">
							<Skeleton className="w-[140px] text-[16px]" />
							<Skeleton className="w-[100px] text-[12px]" />
						</div>
					</>
				) : (
					<>
						<CustomAvatar
							className={cn(isPersonExpired(person) && '[&_img]:grayscale')}
							src={extractAvatarFromContactProviderData(
								contactProvidersData[waId]
							)}
							generateBgColorBy={
								!isPersonExpired(person)
									? person.waba_payload?.profile?.name
									: undefined
							}
						>
							{person.initials}
						</CustomAvatar>

						<div className="pl-[15px]">
							<PrintMessage
								as="h3"
								className="mb-0 text-base text-chat-icon-dark [&_.emoji-mart-emoji]:size-4!"
								message={
									contactProvidersData[waId]?.[0]?.name ??
									person.waba_payload?.profile?.name ??
									(person.wa_id && !isUserActionsRestricted
										? addPlus(person.wa_id)
										: '')
								}
							/>

							<div className="-mt-px flex items-center gap-2.5 text-[12px]">
								{person.wa_id && !isUserActionsRestricted && (
									<span className="text-chat-icon max-[500px]:hidden">
										{addPlus(person.wa_id)}
									</span>
								)}

								{isPersonExpired(person) && (
									<span className="rounded-[10px] bg-chat-icon px-[5px] text-white">
										{t('Expired')}
									</span>
								)}

								{isResolved && (
									<span className="rounded-[10px] bg-[#c9e4cb] px-[5px] text-[#2e7d33]">
										{t('Resolved')}
									</span>
								)}
							</div>
						</div>
					</>
				)}
			</div>

			<div className="flex justify-between">
				{chat && (
					// The chips are still MUI and set their own background with
					// !important, hence the `!` here
					<div className="mr-[5px] flex items-center justify-center gap-2.5 max-[500px]:hidden [&_.assigneeChip]:bg-chat-bg! [&_.tagsChip]:bg-chat-bg!">
						<TagsChip waId={waId} showChatTagsList={showChatTags} />

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
					</div>
				)}

				{isMobileOnly && hasFailedMessages && (
					<Tooltip disableHoverableContent>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon-xl"
								className={headerIconButton}
								onClick={closeChat}
							>
								<WarningIcon className="error" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							{t('Failed to send some messages!')}
						</TooltipContent>
					</Tooltip>
				)}
				<Button
					variant="ghost"
					size="icon-xl"
					className={headerIconButton}
					onClick={showSearchMessages}
				>
					<Search />
				</Button>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon-xl" className={headerIconButton}>
							<MoreVert />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onSelect={showContactDetails}>
							<AccountBoxIcon />
							{t('Contact details')}
						</DropdownMenuItem>
						{!isReadOnly && (
							<>
								<DropdownMenuSeparator />
								{isResolved ? (
									<DropdownMenuItem onSelect={() => updateResolvedCall(false)}>
										<SettingsBackupRestoreIcon />
										{t('Mark as unresolved')}
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem onSelect={() => updateResolvedCall(true)}>
										<DoneIcon />
										{t('Mark as resolved')}
									</DropdownMenuItem>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuItem onSelect={showChatAssignment}>
									<AssignmentTurnedInIcon />
									{t('Assign chat')}
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={showChatTags}>
									<SellIcon />
									{t('Change tags')}
								</DropdownMenuItem>
							</>
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem onSelect={toggleAssignmentAndTaggingHistory}>
							<EventNoteIcon />
							{t('Toggle event history')}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onSelect={closeChat}>
							<CloseIcon />
							{t('Close view')}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
};

export default ChatHeader;
