import React, { useEffect, useRef, useState } from 'react';
import '../../../styles/Sidebar.css';
import {
	Avatar,
	Button,
	CircularProgress,
	Divider,
	Fade,
	IconButton,
	Link,
	Menu,
	MenuItem,
	Tab,
	Tabs,
	Tooltip,
	Zoom,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SidebarChat from './SidebarChat';
import {
	containsLetters,
	generateInitialsHelper,
	isScrollable,
} from '../../../helpers/Helpers';
import {
	CHAT_KEY_PREFIX,
	CHAT_LIST_TAB_CASE_ALL,
	CHAT_LIST_TAB_CASE_GROUP,
	CHAT_LIST_TAB_CASE_ME,
	EVENT_TOPIC_CHAT_ASSIGNMENT,
	EVENT_TOPIC_GO_TO_MSG_ID,
	EVENT_TOPIC_NEW_CHAT_MESSAGES,
	EVENT_TOPIC_UPDATE_PERSON_NAME,
} from '../../../Constants';
import { useHistory, useParams } from 'react-router-dom';
import SearchBar from '../../SearchBar';
import SidebarContactResult from './SidebarContactResult';
import ChatModel from '../../../api/models/ChatModel';
import NewMessageModel from '../../../api/models/NewMessageModel';
import PubSub from 'pubsub-js';
import BusinessProfile from './BusinessProfile';
import ChangePasswordDialog from './ChangePasswordDialog';
import ChatMessageModel from '../../../api/models/ChatMessageModel';
import SearchMessageResult from '../../SearchMessageResult';
import { isMobile, isMobileOnly } from 'react-device-detect';
import ChatIcon from '@material-ui/icons/Chat';
import Contacts from '../../Contacts';
import { clearContactProvidersData } from '../../../helpers/StorageHelper';
import CloseIcon from '@material-ui/icons/Close';
import BulkSendIndicator from './BulkSendIndicator';
import SelectableChatTag from './SelectableChatTag';
import BulkSendActions from './BulkSendActions';
import {
	clearUserSession,
	generateCancelToken,
} from '../../../helpers/ApiHelper';
import Notifications from './Notifications/Notifications';
import { Notifications as NotificationsIcon } from '@material-ui/icons';
import { generateAvatarColor } from '../../../helpers/AvatarHelper';
import { getObjLength } from '../../../helpers/ObjectHelper';
import { getHubURL } from '../../../helpers/URLHelper';
import RetryFailedMessages from './RetryFailedMessages';
import UploadMediaIndicator from './UploadMediaIndicator';
import { Trans, useTranslation } from 'react-i18next';
import { AppConfig } from '../../../contexts/AppConfig';
import { ApplicationContext } from '../../../contexts/ApplicationContext';
import DynamicFeedIcon from '@material-ui/icons/DynamicFeed';
import { filterChat } from '../../../helpers/SidebarHelper';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUser } from '../../../store/reducers/currentUserReducer';
import { setTemplates } from '../../../store/reducers/templatesReducer';
import ChatsResponse from '../../../api/responses/ChatsResponse';
import { setFilterTag } from '../../../store/reducers/filterTagReducer';
import { setChatsCount } from '../../../store/reducers/chatsCountReducer';
import ChatTag from '../../ChatTag';

function Sidebar(props) {
	const { apiService } = React.useContext(ApplicationContext);
	const config = React.useContext(AppConfig);

	const tags = useSelector((state) => state.tags.value);
	const currentUser = useSelector((state) => state.currentUser.value);
	const filterTag = useSelector((state) => state.filterTag.value);
	const chatsCount = useSelector((state) => state.chatsCount.value);

	const { t } = useTranslation();

	const { waId } = useParams();
	const chatsContainer = useRef(null);
	const [anchorEl, setAnchorEl] = useState(null);
	const [bulkMessageMenuAnchorEl, setBulkMessageMenuAnchorEl] = useState(null);
	const [keyword, setKeyword] = useState('');
	const [chatMessages, setChatMessages] = useState({});
	const [contactResults, setContactResults] = useState({});
	const [isProfileVisible, setProfileVisible] = useState(false);
	const [isContactsVisible, setContactsVisible] = useState(false);
	const [isChangePasswordDialogVisible, setChangePasswordDialogVisible] =
		useState(false);
	const [isNotificationsVisible, setNotificationsVisible] = useState(false);
	const [isLoadingChats, setLoadingChats] = useState(false);
	const [isLoadingMoreChats, setLoadingMoreChats] = useState(false);
	const [tabCase, setTabCase] = useState(CHAT_LIST_TAB_CASE_ALL);

	const [missingChats, setMissingChats] = useState([]);

	const history = useHistory();

	const dispatch = useDispatch();

	const logOut = () => {
		clearUserSession(undefined, undefined, history);

		// TODO: Consider calling it in clearUserSession method
		dispatch(setCurrentUser({}));
		dispatch(setTemplates({}));

		hideMenu();
	};

	const forceClearContactProvidersData = () => {
		clearContactProvidersData();
		window.location.reload();
	};

	const displayMenu = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const hideMenu = () => {
		setAnchorEl(null);
	};

	const displayBulkMessageMenu = (event) => {
		setBulkMessageMenuAnchorEl(event.currentTarget);
	};

	const hideBulkMessageMenu = () => {
		setBulkMessageMenuAnchorEl(null);
	};

	const showBulkSendTemplateDialog = () => {
		setBulkMessageMenuAnchorEl(null);
		props.setBulkSendTemplateDialogVisible(true);
	};

	const showBulkSendTemplateViaCSVDialog = () => {
		setBulkMessageMenuAnchorEl(null);
		props.setBulkSendTemplateViaCSVVisible(true);
	};

	const showSendBulkVoiceMessageDialog = () => {
		setBulkMessageMenuAnchorEl(null);
		props.setSendBulkVoiceMessageDialogVisible(true);
	};

	let cancelTokenSourceRef = useRef();

	useEffect(() => {
		// Generate a token
		cancelTokenSourceRef.current = generateCancelToken();

		listChats(cancelTokenSourceRef.current, true, undefined, true);

		if (keyword.trim().length > 0) {
			searchMessages(cancelTokenSourceRef.current);
		}

		return () => {
			if (cancelTokenSourceRef.current) {
				cancelTokenSourceRef.current.cancel(
					'Operation canceled due to new request.'
				);
			}
		};
	}, [keyword, tabCase, filterTag]);

	useEffect(() => {
		// New chatMessages
		const onNewMessages = function (msg, data) {
			// We don't need to update if chats are filtered
			if (keyword.trim().length === 0) {
				let newMissingChats = [];
				const nextState = { ...props.chats };
				let changedAny = false;

				Object.entries(data).forEach((message) => {
					//const msgId = message[0];
					const chatMessage = message[1];
					const chatMessageWaId = chatMessage.waId;

					const chatKey = CHAT_KEY_PREFIX + chatMessageWaId;

					// New chat, incoming or outgoing message
					// Check if chat with waId already exists
					if (!nextState.hasOwnProperty(chatKey)) {
						// Collect waId list to retrieve chats
						if (!newMissingChats.includes(chatMessageWaId)) {
							newMissingChats.push(chatMessageWaId);
						}
					}

					// Chats are ordered by incoming message date
					if (nextState.hasOwnProperty(chatKey)) {
						changedAny = true;

						// Update existing chat
						nextState[chatKey].setLastMessage(chatMessage.payload);

						// Incoming
						if (!chatMessage.isFromUs) {
							// Update name and initials on incoming message if name is missing
							const chat = nextState[chatKey];
							if (chat) {
								const chatName = chat.name;
								if (!containsLetters(chatName)) {
									// Update sidebar chat name
									nextState[chatKey].setName(chatMessage.senderName);

									// Check if current chat
									if (waId === chatMessageWaId) {
										PubSub.publish(
											EVENT_TOPIC_UPDATE_PERSON_NAME,
											chatMessage.senderName
										);
									}
								}
							}
						}
					}

					// New chatMessages
					if (
						!chatMessage.isFromUs &&
						(waId !== chatMessageWaId ||
							document.visibilityState === 'hidden' ||
							props.isBlurred)
					) {
						const preparedNewMessages = props.newMessages;
						if (props.newMessages[chatMessageWaId] === undefined) {
							preparedNewMessages[chatMessageWaId] = new NewMessageModel(
								chatMessageWaId,
								0
							);
						}

						// Increase number of new chatMessages
						preparedNewMessages[chatMessageWaId].newMessages++;

						props.setNewMessages({ ...preparedNewMessages });

						// Display a notification
						if (!chatMessage.isFromUs) {
							props.displayNotification(
								t('New messages'),
								t('You have new messages!'),
								chatMessageWaId
							);
						}
					}
				});

				// If anything has changed, sort chats
				if (changedAny) {
					// Sorting
					const sortedNextState = sortChats(nextState);
					props.setChats({ ...sortedNextState });
				}

				// Collect missing chats to load them periodically
				if (newMissingChats.length > 0) {
					setMissingChats((prevState) => {
						let nextState = prevState.concat(newMissingChats);

						// Unique wa ids
						return [...new Set(nextState)];
					});
				}
			}
		};

		const newChatMessagesEventToken = PubSub.subscribe(
			EVENT_TOPIC_NEW_CHAT_MESSAGES,
			onNewMessages
		);

		return () => {
			PubSub.unsubscribe(newChatMessagesEventToken);
		};
	}, [
		waId,
		props.isBlurred,
		props.chats,
		props.newMessages,
		missingChats,
		keyword,
	]);

	useEffect(() => {
		const onChatAssignment = function (msg, data) {
			let newMissingChats = [];
			const nextState = { ...props.chats };

			Object.entries(data).forEach((message) => {
				//const msgId = message[0];
				const assignmentData = message[1];
				const assignmentEvent = assignmentData.assignmentEvent;

				if (assignmentEvent) {
					const chatKey = CHAT_KEY_PREFIX + assignmentData.waId;

					if (
						assignmentEvent.assigned_group_set ||
						assignmentEvent.assigned_to_user_set
					) {
						// Check if chat exists and is loaded
						if (!nextState.hasOwnProperty(chatKey)) {
							// Collect waId list to retrieve chats
							if (!newMissingChats.includes(assignmentData.waId)) {
								newMissingChats.push(assignmentData.waId);
							}
						}
					}
				}
			});

			if (newMissingChats.length > 0) {
				setMissingChats((prevState) => {
					let nextState = prevState.concat(newMissingChats);

					// Unique wa ids
					return [...new Set(nextState)];
				});
			}
		};

		const chatAssignmentEventToken = PubSub.subscribe(
			EVENT_TOPIC_CHAT_ASSIGNMENT,
			onChatAssignment
		);

		return () => {
			PubSub.unsubscribe(chatAssignmentEventToken);
		};
	}, [props.chats, missingChats]);

	useEffect(() => {
		let intervalId = setInterval(function () {
			if (missingChats?.length > 0) {
				missingChats.forEach((chatMessageWaId) => {
					console.log(
						`A new message is received from ${chatMessageWaId} but this chat is not loaded yet. Retrieving chat via API.`
					);
					retrieveChat(chatMessageWaId);
				});
			}
		}, 2000);

		return () => {
			clearInterval(intervalId);
		};
	}, [missingChats]);

	useEffect(() => {
		const chatsContainerCopy = chatsContainer.current;

		// To optimize scroll event
		let debounceTimer;

		function handleScroll(e) {
			if (debounceTimer) {
				window.clearTimeout(debounceTimer);
			}

			if (keyword) {
				window.clearTimeout(debounceTimer);
				return false;
			}

			debounceTimer = setTimeout(function () {
				// const threshold = 0;
				const el = e.target;

				if (isScrollable(el)) {
					if (el.scrollHeight - el.scrollTop - el.clientHeight < 1) {
						listChats(
							cancelTokenSourceRef.current,
							false,
							getObjLength(props.chats),
							false
						);
					}
				}
			}, 100);
		}

		chatsContainerCopy.addEventListener('scroll', handleScroll);

		return () => {
			clearTimeout(debounceTimer);
			chatsContainerCopy.removeEventListener('scroll', handleScroll);
		};
	}, [props.chats, keyword, filterTag]);

	const search = async (_keyword) => {
		setKeyword(_keyword);
	};

	useEffect(() => {
		if (props.isSelectionModeEnabled) {
			setContactsVisible(false);
		}
	}, [props.isSelectionModeEnabled]);

	const sortChats = (state) => {
		let sortedState = Object.entries(state).sort(
			(a, b) => b[1].lastMessageTimestamp - a[1].lastMessageTimestamp
		);
		return Object.fromEntries(sortedState);
	};

	const listChats = (cancelTokenSource, isInitial, offset, replaceAll) => {
		if (!isInitial) {
			setLoadingMoreChats(true);
		} else {
			props.setLoadingNow('chats');
		}

		// Reset chats count
		dispatch(setChatsCount(undefined));

		if (replaceAll) {
			setLoadingChats(true);
		}

		const assignedToMe = tabCase === CHAT_LIST_TAB_CASE_ME ? true : undefined;
		const assignedGroup =
			tabCase === CHAT_LIST_TAB_CASE_GROUP ? true : undefined;

		apiService.listChatsCall(
			keyword,
			filterTag?.id,
			20,
			offset,
			assignedToMe,
			assignedGroup,
			cancelTokenSource.token,
			(response) => {
				const chatsResponse = new ChatsResponse(response.data);

				dispatch(setChatsCount(chatsResponse.count));

				const preparedChats = chatsResponse.chats;

				props.setChats((prevState) => {
					if (replaceAll) {
						return preparedChats;
					} else {
						return { ...prevState, ...preparedChats };
					}
				});

				// In case param is undefined
				isInitial = isInitial === true;

				if (isInitial) {
					props.setProgress(100);
				}

				const willNotify = !isInitial;

				const preparedNewMessages = {};
				response.data.results.forEach((newMessage) => {
					const newWaId = newMessage.contact.waba_payload.wa_id;
					const newAmount = newMessage.new_messages;
					const prepared = new NewMessageModel(newWaId, newAmount);
					preparedNewMessages[prepared.waId] = prepared;
				});

				if (willNotify) {
					let hasAnyNewMessages = false;
					let chatMessageWaId;

					props.setNewMessages((prevState) => {
						Object.entries(preparedNewMessages).forEach((newMsg) => {
							const newMsgWaId = newMsg[0];
							const number = newMsg[1].newMessages;
							if (newMsgWaId !== waId) {
								// TODO: Consider a new contact (last part of the condition)
								if (
									prevState[newMsgWaId] &&
									number >
										prevState[newMsgWaId]
											.newMessages /*|| (!prevState[newMsgWaId] && number > 0)*/
								) {
									hasAnyNewMessages = true;

									// There can be multiple new chats, we take first one
									if (chatMessageWaId === newMsgWaId)
										chatMessageWaId = newMsgWaId;
								}
							}
						});

						// When state is a JSON object, it is unable to understand whether it is different or same and renders again
						// So we check if new state is actually different than previous state
						if (
							JSON.stringify(preparedNewMessages) !== JSON.stringify(prevState)
						) {
							return { ...prevState, ...preparedNewMessages };
						} else {
							return prevState;
						}
					});

					// Display a notification
					if (hasAnyNewMessages) {
						props.displayNotification(
							t('New messages'),
							t('You have new messages!'),
							chatMessageWaId
						);
					}
				} else {
					props.setNewMessages((prevState) => {
						return { ...prevState, ...preparedNewMessages };
					});
				}

				setLoadingMoreChats(false);
				setLoadingChats(false);
			},
			(error) => {
				console.log(error);

				setLoadingMoreChats(false);
				setLoadingChats(false);

				if (isInitial) {
					props.setInitialResourceFailed(true);
				}
			},
			history
		);
	};

	const retrieveChat = (chatWaId) => {
		apiService.retrieveChatCall(chatWaId, (response) => {
			// Remove this chat from missing chats list
			setMissingChats((prevState) =>
				prevState.filter((item) => item !== chatWaId)
			);

			const preparedChat = new ChatModel(response.data);

			// Don't display chat if tab case is "me" and chat is not assigned to user
			if (tabCase === CHAT_LIST_TAB_CASE_ME) {
				if (
					!preparedChat.assignedToUser ||
					preparedChat.assignedToUser.id !== currentUser?.id
				) {
					console.log(
						'Chat will not be displayed as it does not belong to current tab.'
					);
					return;
				}
			} else if (tabCase === CHAT_LIST_TAB_CASE_GROUP) {
				if (
					!preparedChat.assignedGroup ||
					currentUser?.isInGroup(preparedChat.assignedGroup.id)
				) {
					console.log(
						'Chat will not be displayed as it does not belong to current tab.'
					);
					return;
				}
			}

			props.setChats((prevState) => {
				prevState[CHAT_KEY_PREFIX + chatWaId] = preparedChat;
				const sortedNextState = sortChats(prevState);
				return { ...sortedNextState };
			});
		});
	};

	const searchMessages = (cancelTokenSource) => {
		apiService.listMessagesCall(
			undefined,
			keyword,
			filterTag?.id,
			30,
			undefined,
			undefined,
			undefined,
			cancelTokenSource.source,
			(response) => {
				const preparedMessages = {};
				response.data.results.forEach((message) => {
					const prepared = new ChatMessageModel(message);
					preparedMessages[prepared.id] = prepared;
				});

				setChatMessages(preparedMessages);
			},
			undefined,
			history
		);
	};

	const goToMessage = (chatMessage) => {
		if (waId !== chatMessage.waId) {
			history.push({
				pathname: `/main/chat/${chatMessage.waId}`,
				goToMessage: chatMessage,
			});
		} else {
			PubSub.publish(EVENT_TOPIC_GO_TO_MSG_ID, chatMessage);
		}
	};

	const displayEditBusinessProfile = () => {
		setAnchorEl(null);
		setProfileVisible(true);
	};

	const goToSettings = () => {
		setAnchorEl(null);
		if (window.AndroidWebInterface) {
			window.AndroidWebInterface.goToSettings();
		}
	};

	const showChangePassword = () => {
		setAnchorEl(null);
		setChangePasswordDialogVisible(true);
	};

	const showChatTagsList = () => {
		setAnchorEl(null);
		props.setChatTagsListVisible(true);
	};

	const displayContacts = () => {
		setContactsVisible(true);
	};

	const handleTabChange = (event, newValue) => {
		setTabCase(newValue);
	};

	const clearFilter = () => {
		dispatch(setFilterTag(undefined));
	};

	const cancelSelection = () => {
		props.setSelectionModeEnabled(false);
		props.setSelectedChats([]);
		props.setSelectedTags([]);
	};

	const finishBulkSendMessage = () => {
		props.setSelectionModeEnabled(false);
		props.finishBulkSendMessage();
	};

	const displayNotifications = () => {
		setNotificationsVisible(true);
	};

	return (
		<div className={'sidebar' + (props.isChatOnly ? ' hidden' : '')}>
			<div className="sidebar__header">
				<Avatar
					src={currentUser?.profile?.avatar}
					onClick={() => setProfileVisible(true)}
					className="cursorPointer"
					style={{
						backgroundColor: generateAvatarColor(currentUser?.username),
					}}
				>
					{currentUser ? generateInitialsHelper(currentUser.username) : ''}
				</Avatar>
				<div className="sidebar__headerRight">
					<Tooltip title={t('New chat')}>
						<IconButton onClick={displayContacts} data-test-id="new-chat">
							<ChatIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title={t('Bulk send')}>
						<IconButton onClick={displayBulkMessageMenu}>
							<DynamicFeedIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title={t('Notifications')}>
						<IconButton onClick={displayNotifications}>
							<NotificationsIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title={t('Options')}>
						<IconButton onClick={displayMenu} data-test-id="options">
							<MoreVertIcon />
						</IconButton>
					</Tooltip>
				</div>
			</div>

			{props.isSelectionModeEnabled && (
				<BulkSendActions
					selectedChats={props.selectedChats}
					setSelectedChats={props.setSelectedChats}
					selectedTags={props.selectedTags}
					cancelSelection={cancelSelection}
					finishBulkSendMessage={finishBulkSendMessage}
					setUploadRecipientsCSVVisible={props.setUploadRecipientsCSVVisible}
				/>
			)}

			<SearchBar onChange={(_keyword) => search(_keyword)} />

			{filterTag && (
				<div className="sidebar__clearFilter">
					<div className="sidebar__clearFilter__body mb-1">
						<Trans
							values={{
								postProcess: 'sprintf',
								sprintf: [filterTag.name, chatsCount ?? 0],
							}}
						>
							Showing only:&nbsp;
							<ChatTag id={filterTag.id} />
							&nbsp;<span className="bold">%s</span>&nbsp;(%d chats)
						</Trans>
					</div>
					<Button
						className="sidebar__clearFilter__clear"
						size="small"
						startIcon={<CloseIcon />}
						onClick={clearFilter}
					>
						{t('Click to clear filter')}
					</Button>
				</div>
			)}

			<div className="sidebar__tabs">
				<Tabs
					textColor="primary"
					indicatorColor="primary"
					variant={'fullWidth'}
					value={tabCase}
					scrollButtons="auto"
					onChange={handleTabChange}
				>
					<Tab
						label={
							isLoadingChats && tabCase === CHAT_LIST_TAB_CASE_ALL ? (
								<CircularProgress size={20} variant={'indeterminate'} />
							) : (
								t('All')
							)
						}
						value={CHAT_LIST_TAB_CASE_ALL}
					/>
					<Tab
						label={
							isLoadingChats && tabCase === CHAT_LIST_TAB_CASE_ME ? (
								<CircularProgress size={20} variant={'indeterminate'} />
							) : (
								t('Me')
							)
						}
						value={CHAT_LIST_TAB_CASE_ME}
					/>
					<Tab
						label={
							isLoadingChats && tabCase === CHAT_LIST_TAB_CASE_GROUP ? (
								<CircularProgress size={20} variant={'indeterminate'} />
							) : (
								t('Group')
							)
						}
						value={CHAT_LIST_TAB_CASE_GROUP}
					/>
				</Tabs>
			</div>

			<div className="sidebar__results" ref={chatsContainer}>
				{props.isSelectionModeEnabled && tags && <h3>Tags</h3>}

				{props.isSelectionModeEnabled && tags && (
					<div>
						{Object.entries(tags).map((tag) => (
							<SelectableChatTag
								key={tag[0]}
								data={tag[1]}
								selectedTags={props.selectedTags}
								setSelectedTags={props.setSelectedTags}
							/>
						))}
					</div>
				)}

				{(keyword.trim().length > 0 || props.isSelectionModeEnabled) && (
					<h3>Chats</h3>
				)}

				<div className="sidebar__results__chats">
					{Object.entries(props.chats)
						.filter((chat) => {
							// Filter by helper method
							return filterChat(currentUser, tabCase, chat[1]);
						})
						.map((chat) => (
							<SidebarChat
								key={chat[0]}
								chatData={chat[1]}
								pendingMessages={props.pendingMessages}
								newMessages={props.newMessages}
								keyword={keyword}
								contactProvidersData={props.contactProvidersData}
								retrieveContactData={props.retrieveContactData}
								tabCase={tabCase}
								bulkSendPayload={props.bulkSendPayload}
								isSelectionModeEnabled={props.isSelectionModeEnabled}
								selectedChats={props.selectedChats}
								setSelectedChats={props.setSelectedChats}
							/>
						))}

					{Object.keys(props.chats).length === 0 && (
						<span className="sidebar__results__chats__noResult">
							{keyword.trim().length > 0 ? (
								<span>
									<Trans>
										No chats found for:{' '}
										<span className="searchOccurrence">{keyword}</span>
									</Trans>
								</span>
							) : (
								!isLoadingChats && (
									<span>{t("You don't have any chats yet.")}</span>
								)
							)}
						</span>
					)}
				</div>

				{keyword.trim().length > 0 && getObjLength(contactResults) > 0 && (
					<h3>{t('Contacts')}</h3>
				)}

				{keyword.trim().length > 0 && getObjLength(contactResults) > 0 && (
					<div className="sidebar__results__contacts">
						{Object.entries(contactResults).map((contactResult) => (
							<SidebarContactResult
								key={contactResult[0]}
								chatData={contactResult[1]}
							/>
						))}
					</div>
				)}

				{keyword.trim().length > 0 && getObjLength(chatMessages) > 0 && (
					<h3>{t('Messages')}</h3>
				)}

				{keyword.trim().length > 0 && getObjLength(chatMessages) > 0 && (
					<div className="sidebar__results__messages">
						{Object.entries(chatMessages).map((message) => (
							<SearchMessageResult
								key={message[0]}
								waId={waId}
								messageData={message[1]}
								keyword={keyword}
								displaySender={true}
								onClick={(chatMessage) => goToMessage(chatMessage)}
							/>
						))}
					</div>
				)}
			</div>

			<Fade in={isLoadingMoreChats} unmountOnExit>
				<div className="sidebar__loadingMore">
					<Zoom in={isLoadingMoreChats}>
						<div className="sidebar__loadingMore__wrapper">
							<CircularProgress size={28} />
						</div>
					</Zoom>
				</div>
			</Fade>

			{isContactsVisible && (
				<Contacts
					contactProvidersData={props.contactProvidersData}
					onHide={() => setContactsVisible(false)}
				/>
			)}

			{isProfileVisible && (
				<BusinessProfile
					onHide={() => setProfileVisible(false)}
					displayEditBusinessProfile={displayEditBusinessProfile}
					setChangePasswordDialogVisible={setChangePasswordDialogVisible}
				/>
			)}

			{props.isUploadingMedia && !isMobileOnly && <UploadMediaIndicator />}

			{props.hasFailedMessages && (
				<RetryFailedMessages
					pendingMessages={props.pendingMessages}
					setPendingMessages={props.setPendingMessages}
					isSendingPendingMessages={props.isSendingPendingMessages}
					lastSendAttemptAt={props.lastSendAttemptAt}
					contactProvidersData={props.contactProvidersData}
					chats={props.chats}
				/>
			)}

			<BulkSendIndicator />

			<Menu
				anchorEl={anchorEl}
				getContentAnchorEl={null}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={hideMenu}
				elevation={3}
			>
				<MenuItem onClick={showChatTagsList}>{t('Tags')}</MenuItem>
				<Divider />
				<MenuItem
					className="sidebar__menu__refresh"
					onClick={() => window.location.reload()}
				>
					{t('Refresh')}
				</MenuItem>
				<MenuItem onClick={showChangePassword}>{t('Change password')}</MenuItem>
				<MenuItem onClick={forceClearContactProvidersData}>
					{t('Refresh contacts')}
				</MenuItem>
				{currentUser?.isAdmin && <Divider />}
				{currentUser?.isAdmin && (
					<MenuItem
						component={Link}
						href={getHubURL(config.API_BASE_URL)}
						target="_blank"
						color="initial"
					>
						{t('Admin panel')}
					</MenuItem>
				)}
				{isMobile && (
					<MenuItem onClick={goToSettings}>{t('Settings (App Only)')}</MenuItem>
				)}
				<Divider />
				<MenuItem onClick={logOut} data-test-id="logout-button">
					{t('Logout')}
				</MenuItem>
			</Menu>

			<Menu
				anchorEl={bulkMessageMenuAnchorEl}
				getContentAnchorEl={null}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				keepMounted
				open={Boolean(bulkMessageMenuAnchorEl)}
				onClose={hideBulkMessageMenu}
				elevation={3}
			>
				<MenuItem onClick={showBulkSendTemplateDialog}>
					{t(' Bulk send a template')}
				</MenuItem>
				{/*<MenuItem onClick={showBulkSendTemplateViaCSVDialog}>
					{t('Bulk send template with CSV')}
				</MenuItem>*/}
				<MenuItem onClick={showSendBulkVoiceMessageDialog}>
					{t(' Bulk send a voice message')}
				</MenuItem>
			</Menu>

			<ChangePasswordDialog
				open={isChangePasswordDialogVisible}
				setOpen={setChangePasswordDialogVisible}
			/>

			{isNotificationsVisible && (
				<Notifications onHide={() => setNotificationsVisible(false)} />
			)}
		</div>
	);
}

export default Sidebar;
