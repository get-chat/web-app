// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { Badge, Fab, IconButton, Tooltip, Zoom } from '@mui/material';
import {
	Add,
	ArrowDownward,
	AttachFile,
	InsertEmoticon,
	Send,
} from '@mui/icons-material';
import SmsIcon from '@mui/icons-material/Sms';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ContactsIcon from '@mui/icons-material/Contacts';
import NotesIcon from '@mui/icons-material/Notes';
import MicIcon from '@mui/icons-material/Mic';
import { Emoji, NimblePicker } from 'emoji-mart';
import styles from './ChatFooter.module.css';
import 'emoji-mart/css/emoji-mart.css';
import '../../styles/EmojiPicker.css';
import CloseIcon from '@mui/icons-material/Close';
import PubSub from 'pubsub-js';
import FileInput from '../FileInput';
import {
	getSelectionHtml,
	sanitize,
	translateHTMLInputToText,
} from '@src/helpers/Helpers';
import VoiceRecord from './VoiceRecord';
import {
	EMOJI_SET,
	EMOJI_SHEET_SIZE,
	EMPTY_IMAGE_BASE64,
	EVENT_TOPIC_EMOJI_PICKER_VISIBILITY,
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

const cx = classNames.bind(styles);

const ChatFooter: React.FC = ({
	waId,
	currentNewMessages,
	isExpired,
	input,
	setInput,
	sendMessage,
	bulkSendMessage,
	setSelectedFiles,
	isTemplateMessagesVisible,
	setTemplateMessagesVisible,
	accept,
	isSavedResponsesVisible,
	setSavedResponsesVisible,
	sendHandledChosenFiles,
	setAccept,
	isScrollButtonVisible,
	handleScrollButtonClick,
	processCommand,
}) => {
	const { t } = useTranslation();

	const fileInput = useRef(null);
	const editable = useRef(null);

	const [isEmojiPickerVisible, setEmojiPickerVisible] = useState(false);
	const [isMoreVisible, setMoreVisible] = useState(false);
	const [contactsModalVisible, setContactsModalVisible] = useState(false);
	const [isQuickActionsMenuVisible, setQuickActionsMenuVisible] =
		useState(false);

	const [isRecording, setRecording] = useState(false);

	const handleAttachmentClick = (acceptValue) => {
		setAccept(acceptValue);

		fileInput.current.setAttribute('accept', acceptValue);
		fileInput.current.click();

		if (window.AndroidWebInterface) {
			window.AndroidWebInterface.requestPermissions();
		}
	};

	const handleEmojiPickerVisibility = function (msg, data) {
		setEmojiPickerVisible(data);
	};

	let timeout = useRef();
	const handleEditableChange = (event) => {
		if (timeout.current) {
			clearTimeout(timeout.current);
		}

		timeout.current = setTimeout(function () {
			setInput(event.target.innerHTML);
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
		const preparedInput = translateHTMLInputToText(input).trim();
		if (preparedInput.startsWith('/')) {
			displayQuickActionsMenu();
		}
	}, [input]);

	useEffect(() => {
		// Clear editable div when message is sent
		if (input === '') {
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

		// Hide saved responses first
		setSavedResponsesVisible(false);

		setTemplateMessagesVisible((prevState) => !prevState);
	};

	const toggleSavedResponses = () => {
		// Hide template messages first
		setTemplateMessagesVisible(false);

		setSavedResponsesVisible((prevState) => !prevState);
	};

	function insertAtCursor(el, html) {
		if (!html) return;

		// Sanitize input
		html = sanitize(html);

		// Preserving new lines
		html = html.replace(/(?:\r\n|\r|\n)/g, '<br>');

		//html = html.replace('<span', '<span contentEditable="false"');
		html = html
			.replace('<span', '<img src="' + EMPTY_IMAGE_BASE64 + '"')
			.replace('</span>', '');
		el.focus();

		let selection = window.getSelection();
		let range = selection.getRangeAt(0);
		range.deleteContents();
		let node = range.createContextualFragment(html);
		range.insertNode(node);

		// Persist cursor position
		selection.collapseToEnd();

		//el.dispatchEvent(new Event('input'));
		setInput(el.innerHTML);
	}

	const handleEmojiSelect = (emoji) => {
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

	const handlePaste = (event) => {
		let text = (event.originalEvent || event).clipboardData.getData(
			'text/plain'
		);
		text = replaceEmojis(text, true);

		insertAtCursor(editable.current, text);

		event.preventDefault();
	};

	const handleCopy = (event) => {
		let data = getSelectionHtml();
		data = translateHTMLInputToText(data);
		event.clipboardData.setData('text', data);

		event.preventDefault();
	};

	const displayQuickActionsMenu = () => {
		if (!isQuickActionsMenuVisible) {
			// Using setTimeout to avoid instant disappear bug with handle click outside library
			setTimeout(() => {
				setQuickActionsMenuVisible(true);
				setTemplateMessagesVisible(false);
				setSavedResponsesVisible(false);
				setEmojiPickerVisible(false);
			}, 150);
		}
	};

	const handleFocus = (event) => {
		if (isExpired) {
			event.target.blur();
			displayQuickActionsMenu();
			return;
		}

		if (isRecording) {
			event.target.blur();
		}
	};

	const hasInput = () => {
		return input && input.length > 0;
	};

	const showMore = () => {
		setEmojiPickerVisible(false);
		setMoreVisible(true);
	};

	const hideMore = () => {
		setTemplateMessagesVisible(false);
		setMoreVisible(false);
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
			className={styles.container}
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
				sendMessage={sendMessage}
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
							onFocus={(event) => handleFocus(event)}
							onPaste={(event) => handlePaste(event)}
							onCopy={(event) => handleCopy(event)}
							onDrop={(event) => event.preventDefault()}
							spellCheck="true"
							onInput={(event) => handleEditableChange(event)}
							onKeyDown={(e) => {
								if (e.keyCode === 13 && !e.shiftKey) sendMessage(true, e);
							}}
						/>
					</div>
					<button onClick={(e) => sendMessage(true, e)} type="submit">
						{t('Send a message')}
					</button>
				</form>

				{!hasInput() && !isExpired && (
					<div className="mobileOnly">
						<Tooltip title={t('More')}>
							<IconButton onClick={showMore} size="large">
								<Add />
							</IconButton>
						</Tooltip>
					</div>
				)}
			</div>

			<div
				className={cx({
					row: true,
					actionsRow: true,
				})}
			>
				<Tooltip title={t('Quick Actions')} placement="top">
					<IconButton
						className={cx({
							actionIcon: true,
							active: isQuickActionsMenuVisible,
						})}
						onClick={displayQuickActionsMenu}
						size="small"
					>
						<KeyboardCommandKeyIcon />
					</IconButton>
				</Tooltip>

				{!isExpired && (
					<div
						className={cx({
							attachmentContainer: true,
							desktopOnly: true,
						})}
					>
						<Tooltip title={t('Attachment')} placement="top">
							<IconButton className={styles.actionIcon} size="small">
								<AttachFile />
							</IconButton>
						</Tooltip>

						<div className={styles.attachmentOptions}>
							<Tooltip title={t('Contacts')} placement="right">
								<IconButton
									className={styles.attachmentOptionDocument}
									onClick={openContactsModal}
									size="large"
								>
									<ContactsIcon />
								</IconButton>
							</Tooltip>

							<Tooltip title={t('Documents')} placement="right">
								<IconButton
									className={styles.attachmentOptionDocument}
									onClick={() => handleAttachmentClick(ACCEPT_DOCUMENT)}
									size="large"
								>
									<InsertDriveFileIcon />
								</IconButton>
							</Tooltip>

							<Tooltip title={t('Images & Videos')} placement="right">
								<IconButton
									className={styles.attachmentOptionImageAndVideo}
									onClick={() => handleAttachmentClick(ACCEPT_IMAGE_AND_VIDEO)}
									size="large"
								>
									<ImageIcon />
								</IconButton>
							</Tooltip>
						</div>
					</div>
				)}

				<Tooltip
					title="Templates"
					placement="top"
					className={cx({
						desktopOnly: !isExpired,
					})}
				>
					<IconButton
						data-test-id="templates-button"
						onClick={toggleTemplateMessages}
						className={cx({
							actionIcon: true,
							active: isTemplateMessagesVisible,
						})}
						size="small"
					>
						<SmsIcon />
					</IconButton>
				</Tooltip>

				{!isExpired && (
					<Tooltip
						title="Saved Responses"
						placement="top"
						className="desktopOnly"
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

				{!isExpired && (
					<Tooltip title={t('Emoji')} placement="top">
						<IconButton
							className={cx({
								actionIcon: true,
								active: isEmojiPickerVisible,
							})}
							onClick={() => setEmojiPickerVisible((prevState) => !prevState)}
							size="small"
						>
							<InsertEmoticon />
						</IconButton>
					</Tooltip>
				)}

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
						<Tooltip title={t('Bulk Send')} placement="top">
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
						<Tooltip title={t('Voice')} placement="top">
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
						<Tooltip title={t('Send')} placement="top">
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

			{isMoreVisible && (
				<div className={styles.footerMore}>
					<IconButton onClick={hideMore} size="large">
						<CloseIcon />
					</IconButton>

					<IconButton onClick={openContactsModal} size="large">
						<ContactsIcon />
					</IconButton>

					<IconButton
						onClick={() => handleAttachmentClick(ACCEPT_DOCUMENT)}
						size="large"
					>
						<InsertDriveFileIcon />
					</IconButton>

					<IconButton
						onClick={() => handleAttachmentClick(ACCEPT_IMAGE_AND_VIDEO)}
						size="large"
					>
						<ImageIcon />
					</IconButton>

					<IconButton
						onClick={toggleTemplateMessages}
						className={cx({
							actionButton: true,
							active: isTemplateMessagesVisible,
						})}
						size="large"
					>
						<SmsIcon />
					</IconButton>

					<IconButton
						onClick={toggleSavedResponses}
						className={cx({
							actionButton: true,
							active: isSavedResponsesVisible,
						})}
						size="large"
					>
						<NotesIcon />
					</IconButton>
				</div>
			)}

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
