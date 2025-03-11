import React, { SetStateAction, useEffect, useRef, useState } from 'react';
import { Badge, Fab, Grow, IconButton, Tooltip, Zoom } from '@mui/material';
import {
	ArrowDownward,
	AttachFile,
	InsertEmoticon,
	Send,
} from '@mui/icons-material';
import SmsIcon from '@mui/icons-material/Sms';
import TryIcon from '@mui/icons-material/Try';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ContactsIcon from '@mui/icons-material/Contacts';
import NotesIcon from '@mui/icons-material/Notes';
import MicIcon from '@mui/icons-material/Mic';
// @ts-ignore
import { Emoji, NimblePicker } from 'emoji-mart';
import styles from './ChatFooter.module.css';
import 'emoji-mart/css/emoji-mart.css';
import '../../styles/EmojiPicker.css';
import PubSub from 'pubsub-js';
import FileInput from '../FileInput';
import { translateHTMLInputToText } from '@src/helpers/Helpers';
import VoiceRecord from './VoiceRecord';
import {
	EMOJI_SET,
	EMOJI_SHEET_SIZE,
	EVENT_TOPIC_EMOJI_PICKER_VISIBILITY,
	EVENT_TOPIC_FOCUS_MESSAGE_INPUT,
	EVENT_TOPIC_REQUEST_MIC_PERMISSION,
} from '@src/Constants';
import ChatMessageModel from '../../api/models/ChatMessageModel';
import { replaceEmojis } from '@src/helpers/EmojiHelper';
import { useTranslation } from 'react-i18next';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import ContactsModal from '../ContactsModal';
import data from 'emoji-mart/data/facebook.json';
import QuickActionsMenu from '@src/components/QuickActionsMenu';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import classNames from 'classnames/bind';
import useChatFooter from '@src/components/ChatFooter/useChatFooter';
import BulkSendPayload from '@src/interfaces/BulkSendPayload';
import ChosenFileList from '@src/interfaces/ChosenFileList';

const cx = classNames.bind(styles);

interface Props {
	waId: string | undefined;
	currentNewMessages: number;
	isExpired: boolean;
	input: string;
	setInput: (value: string) => void;
	sendMessage: (
		willQueue: boolean,
		e?: Event | React.KeyboardEvent | React.MouseEvent,
		customPayload?: object,
		successCallback?: () => void,
		completeCallback?: () => void
	) => void;
	bulkSendMessage: (type: string, payload?: BulkSendPayload) => void;
	setSelectedFiles: (value: any) => void;
	isTemplatesVisible: boolean;
	setTemplatesVisible: React.Dispatch<SetStateAction<boolean>>;
	isInteractiveMessagesVisible: boolean;
	setInteractiveMessagesVisible: React.Dispatch<SetStateAction<boolean>>;
	accept: string;
	setAccept: (value: string) => void;
	isSavedResponsesVisible: boolean;
	setSavedResponsesVisible: React.Dispatch<SetStateAction<boolean>>;
	sendHandledChosenFiles: (files: ChosenFileList) => void;
	isScrollButtonVisible: boolean;
	handleScrollButtonClick: () => void;
	processCommand: (text: string) => void;
}

const ChatFooter: React.FC<Props> = ({
	waId,
	currentNewMessages,
	isExpired,
	input,
	setInput,
	sendMessage,
	bulkSendMessage,
	setSelectedFiles,
	isTemplatesVisible,
	setTemplatesVisible,
	isInteractiveMessagesVisible,
	setInteractiveMessagesVisible,
	accept,
	setAccept,
	isSavedResponsesVisible,
	setSavedResponsesVisible,
	sendHandledChosenFiles,
	isScrollButtonVisible,
	handleScrollButtonClick,
	processCommand,
}) => {
	const { t } = useTranslation();

	const fileInput = useRef<HTMLInputElement>(null);
	const editable = useRef<HTMLDivElement>(null);

	const [isAttachmentOptionsVisible, setAttachmentOptionsVisible] =
		useState(false);
	const [isEmojiPickerVisible, setEmojiPickerVisible] = useState(false);
	const [contactsModalVisible, setContactsModalVisible] = useState(false);
	const [isQuickActionsMenuVisible, setQuickActionsMenuVisible] =
		useState(false);

	const [isRecording, setRecording] = useState(false);

	const { insertAtCursor, handleCopy } = useChatFooter({ setInput });

	const handleAttachmentClick = (acceptValue: string) => {
		setAccept(acceptValue);

		fileInput.current?.setAttribute('accept', acceptValue);
		fileInput.current?.click();

		if (window.AndroidWebInterface) {
			window.AndroidWebInterface.requestPermissions();
		}
	};

	const handleEmojiPickerVisibility = function (msg: string, data: any) {
		setEmojiPickerVisible(data);
	};

	let timeout = useRef<NodeJS.Timeout>();
	const handleEditableChange = (event: React.FormEvent<HTMLDivElement>) => {
		if (timeout.current) {
			clearTimeout(timeout.current);
		}

		timeout.current = setTimeout(function () {
			setInput((event.target as HTMLDivElement).innerHTML);
		}, 5);
	};

	useEffect(() => {
		const token = PubSub.subscribe(
			EVENT_TOPIC_EMOJI_PICKER_VISIBILITY,
			handleEmojiPickerVisibility
		);

		return () => {
			PubSub.unsubscribe(token);
		};
	}, []);

	useEffect(() => {
		// Workaround for focused input for expired chats
		if (isExpired) {
			editable.current?.blur();
		}

		// Focus on the message input when chat is loaded
		const eventToken = PubSub.subscribe(EVENT_TOPIC_FOCUS_MESSAGE_INPUT, () => {
			if (!isExpired) {
				editable.current?.focus();
			}
		});

		return () => {
			PubSub.unsubscribe(eventToken);
		};
	}, [editable.current, isExpired]);

	useEffect(() => {
		const preparedInput = translateHTMLInputToText(input).trim();
		if (preparedInput.startsWith('/')) {
			displayQuickActionsMenu();
		}
	}, [input]);

	useEffect(() => {
		// Clear editable div when message is sent
		if (input === '' && editable.current) {
			editable.current.innerHTML = '';
		}
	}, [editable, input]);

	const toggleTemplateMessages = () => {
		// If messages container is already scrolled to bottom
		/*const elem = messagesContainer.current;
        const offset = 5;

        let willScroll = false;
        if (elem.offsetHeight + elem.scrollTop >= (elem.scrollHeight - offset)) {
            willScroll = true;
        }*/

		setTemplatesVisible((prevState) => {
			if (!prevState) {
				setInteractiveMessagesVisible(false);
				setAttachmentOptionsVisible(false);
				setSavedResponsesVisible(false);
				setEmojiPickerVisible(false);
			}

			return !prevState;
		});
	};

	const toggleInteractiveMessages = () => {
		setInteractiveMessagesVisible((prevState) => {
			if (!prevState) {
				setTemplatesVisible(false);
				setAttachmentOptionsVisible(false);
				setSavedResponsesVisible(false);
				setEmojiPickerVisible(false);
			}

			return !prevState;
		});
	};

	const toggleSavedResponses = () => {
		setSavedResponsesVisible((prevState) => {
			if (!prevState) {
				setInteractiveMessagesVisible(false);
				setAttachmentOptionsVisible(false);
				setTemplatesVisible(false);
				setEmojiPickerVisible(false);
			}

			return !prevState;
		});
	};

	const toggleEmojiPicker = () => {
		setEmojiPickerVisible((prevState) => {
			if (!prevState) {
				setTemplatesVisible(false);
				setAttachmentOptionsVisible(false);
				setTemplatesVisible(false);
				setSavedResponsesVisible(false);
			}

			return !prevState;
		});
	};

	const handleEmojiSelect = (emoji: any) => {
		if (isRecording) {
			return;
		}

		if (editable.current) {
			// TODO: Try to avoid creating an emoji object here, if possible
			const emojiOutput = Emoji({
				html: true,
				emoji: emoji.colons,
				size: 22,
				set: EMOJI_SET,
				sheetSize: EMOJI_SHEET_SIZE,
			});

			insertAtCursor(editable.current, emojiOutput);
		}
	};

	const handlePaste = (event: React.ClipboardEvent<HTMLElement>) => {
		let text: string | undefined = event.clipboardData.getData('text/plain');
		text = replaceEmojis(text, true);
		insertAtCursor(editable.current, text);
		event.preventDefault();
	};

	const displayQuickActionsMenu = () => {
		if (!isQuickActionsMenuVisible) {
			setQuickActionsMenuVisible(true);
			setTemplatesVisible(false);
			setSavedResponsesVisible(false);
			setEmojiPickerVisible(false);
		}
	};

	const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
		if (isRecording) {
			event.target.blur();
		}
	};

	const handleMouseUp = () => {
		if (isExpired) {
			displayQuickActionsMenu();
		}
	};

	const hasInput = () => {
		return input && input.length > 0;
	};

	const openContactsModal = () => {
		setContactsModalVisible(true);
	};

	const closeContactsModal = () => {
		setContactsModalVisible(false);
	};

	// https://developers.facebook.com/docs/whatsapp/on-premises/reference/media#supported-files
	const ACCEPT_IMAGE_AND_VIDEO = 'image/jpeg, image/png, video/mp4, video/3gpp';
	const ACCEPT_DOCUMENT = '*.*';

	return (
		<div
			className={cx({
				chatFooterGlobal: true,
				container: true,
			})}
			onDrop={(event) => event.preventDefault()}
		>
			{isQuickActionsMenuVisible && (
				<QuickActionsMenu
					input={translateHTMLInputToText(input).trim()}
					setInput={setInput}
					setVisible={setQuickActionsMenuVisible}
					onProcessCommand={processCommand}
					isExpired={isExpired}
				/>
			)}

			{isEmojiPickerVisible && (
				<div className={styles.emojiPicker}>
					<NimblePicker
						set={EMOJI_SET}
						sheetSize={EMOJI_SHEET_SIZE}
						data={data}
						showPreview={false}
						emojiSize={32}
						onSelect={handleEmojiSelect}
					/>
				</div>
			)}

			<ContactsModal
				open={contactsModalVisible}
				onClose={closeContactsModal}
				sendMessage={(payload, onSuccess) =>
					sendMessage(false, undefined, payload, onSuccess)
				}
				recipientWaId={waId}
			/>

			<div className={cx({ row: true, footer: true })}>
				<form>
					<div
						className={cx({
							typeBox: true,
							expired: isExpired,
						})}
					>
						{!input && (
							<div className={styles.typeBoxHint}>
								{isExpired ? (
									<span>
										{t(
											'This chat has expired. You need to answer with template messages.'
										)}
									</span>
								) : (
									<span>{t('Type a message')}</span>
								)}
							</div>
						)}
						<div
							id="typeBox__editable"
							ref={editable}
							className={styles.typeBoxEditable}
							contentEditable="true"
							onFocus={handleFocus}
							onMouseUp={handleMouseUp}
							onPaste={(event) => handlePaste(event)}
							onCopy={(event) => handleCopy(event)}
							onDrop={(event) => event.preventDefault()}
							spellCheck="true"
							onInput={(event) => handleEditableChange(event)}
							onKeyDown={(e: React.KeyboardEvent) => {
								if (e.keyCode === 13 && !e.shiftKey) sendMessage(true, e);
							}}
						/>
					</div>
					<button
						onClick={(e: React.MouseEvent) => sendMessage(true, e)}
						type="submit"
					>
						{t('Send a message')}
					</button>
				</form>
			</div>

			<div
				className={cx({
					row: true,
					actionsRow: true,
				})}
			>
				<div
					className={cx({
						actionsRowLeft: true,
						desktopOnly: isRecording,
					})}
				>
					<Tooltip
						title={t('Quick Actions')}
						placement="top"
						disableInteractive
					>
						<IconButton
							className={cx({
								actionIcon: true,
								active: isQuickActionsMenuVisible,
								commandActionIcon: true,
							})}
							onClick={displayQuickActionsMenu}
							size="small"
						>
							<KeyboardCommandKeyIcon />
						</IconButton>
					</Tooltip>

					<div
						className={cx({
							actionSeparator: true,
							desktopOnly: isAttachmentOptionsVisible,
						})}
					/>

					<Tooltip
						title={t('Templates')}
						placement="top"
						className={cx({
							desktopOnly: isAttachmentOptionsVisible,
						})}
						disableInteractive
					>
						<IconButton
							data-test-id="templates-button"
							onClick={toggleTemplateMessages}
							className={cx({
								actionIcon: true,
								active: isTemplatesVisible,
							})}
							size="small"
						>
							<SmsIcon />
						</IconButton>
					</Tooltip>

					{!isExpired && (
						<Tooltip
							title={t('Interactive Messages')}
							placement="top"
							className={cx({
								desktopOnly: isAttachmentOptionsVisible,
							})}
							disableInteractive
						>
							<IconButton
								onClick={toggleInteractiveMessages}
								className={cx({
									actionIcon: true,
									active: isInteractiveMessagesVisible,
								})}
								size="small"
							>
								<TryIcon />
							</IconButton>
						</Tooltip>
					)}

					{!isExpired && (
						<Tooltip
							title={t('Saved Responses')}
							placement="top"
							className={cx({
								desktopOnly: isAttachmentOptionsVisible,
							})}
							disableInteractive
						>
							<IconButton
								onClick={toggleSavedResponses}
								className={cx({
									actionIcon: true,
									active: isSavedResponsesVisible,
								})}
								size="small"
							>
								<NotesIcon />
							</IconButton>
						</Tooltip>
					)}

					{!isExpired && <div className={styles.actionSeparator} />}

					{!isExpired && (
						<Tooltip
							title={t('Emoji')}
							placement="top"
							className={cx({
								desktopOnly: isAttachmentOptionsVisible,
							})}
							disableInteractive
						>
							<IconButton
								className={cx({
									actionIcon: true,
									active: isEmojiPickerVisible,
								})}
								onClick={toggleEmojiPicker}
								size="small"
							>
								<InsertEmoticon />
							</IconButton>
						</Tooltip>
					)}

					{!isExpired && (
						<div
							className={cx({
								attachmentContainer: true,
								open: isAttachmentOptionsVisible,
							})}
						>
							<Tooltip
								title={t('Attachment')}
								placement="top"
								disableInteractive
							>
								<IconButton
									className={cx({
										actionIcon: true,
										active: isAttachmentOptionsVisible,
									})}
									size="small"
									onClick={() =>
										setAttachmentOptionsVisible(!isAttachmentOptionsVisible)
									}
								>
									<AttachFile />
								</IconButton>
							</Tooltip>

							<Grow in={isAttachmentOptionsVisible} unmountOnExit>
								<div
									className={cx({
										attachmentOptions: true,
									})}
								>
									<Tooltip
										title={t('Images & Videos')}
										placement="top"
										disableInteractive
									>
										<IconButton
											className={cx({
												actionIcon: true,
												attachmentOptionImageAndVideo: true,
											})}
											onClick={() =>
												handleAttachmentClick(ACCEPT_IMAGE_AND_VIDEO)
											}
											size="small"
										>
											<ImageIcon />
										</IconButton>
									</Tooltip>

									<Tooltip
										title={t('Documents')}
										placement="top"
										disableInteractive
									>
										<IconButton
											className={cx({
												actionIcon: true,
												attachmentOptionDocument: true,
											})}
											onClick={() => handleAttachmentClick(ACCEPT_DOCUMENT)}
											size="small"
										>
											<InsertDriveFileIcon />
										</IconButton>
									</Tooltip>

									<Tooltip
										title={t('Contacts')}
										placement="top"
										disableInteractive
									>
										<IconButton
											className={cx({
												actionIcon: true,
											})}
											onClick={openContactsModal}
											size="small"
										>
											<ContactsIcon />
										</IconButton>
									</Tooltip>
								</div>
							</Grow>
						</div>
					)}
				</div>

				<div className={styles.actionsRowRight}>
					<div
						className={cx({
							hidden: !isRecording,
						})}
					>
						<VoiceRecord
							voiceRecordCase="chat"
							setRecording={setRecording}
							sendHandledChosenFiles={sendHandledChosenFiles}
						/>
					</div>

					{hasInput() && (
						<Tooltip title={t('Bulk Send')} placement="top" disableInteractive>
							<IconButton
								className={styles.actionIcon}
								onClick={() => bulkSendMessage(ChatMessageModel.TYPE_TEXT)}
								size="small"
							>
								<DynamicFeedIcon />
							</IconButton>
						</Tooltip>
					)}

					{!isExpired && !hasInput() && !isRecording && (
						<Tooltip title={t('Voice')} placement="top" disableInteractive>
							<IconButton
								className={styles.actionIcon}
								onClick={() =>
									PubSub.publish(EVENT_TOPIC_REQUEST_MIC_PERMISSION, 'chat')
								}
								size="small"
							>
								<MicIcon />
							</IconButton>
						</Tooltip>
					)}

					{hasInput() && (
						<Tooltip title={t('Send')} placement="top" disableInteractive>
							<IconButton
								className={styles.actionIcon}
								onClick={(e) => sendMessage(true, e)}
								data-test-id="send-message-button"
								size="small"
							>
								<Send />
							</IconButton>
						</Tooltip>
					)}
				</div>
			</div>

			<div className="hidden">
				<FileInput
					innerRef={fileInput}
					accept={accept}
					handleSelectedFiles={(files) => {
						if (
							accept !== ACCEPT_DOCUMENT &&
							!ACCEPT_IMAGE_AND_VIDEO.includes(files[0].type)
						) {
							window.displayCustomError(
								t('Please choose a supported file type (png, jpg, mp4, 3gp)')
							);

							return;
						}

						setSelectedFiles({ ...files });
					}}
				/>
			</div>

			<Zoom in={isScrollButtonVisible}>
				<Badge
					className={styles.scrollButtonWrapper}
					color="primary"
					overlap="rectangular"
					badgeContent={currentNewMessages}
					invisible={currentNewMessages === 0}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
				>
					<Fab
						onClick={handleScrollButtonClick}
						className={styles.scrollButton}
						size="small"
					>
						<ArrowDownward />
					</Fab>
				</Badge>
			</Zoom>
		</div>
	);
};

export default ChatFooter;
