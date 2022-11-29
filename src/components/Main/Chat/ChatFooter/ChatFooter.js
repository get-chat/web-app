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
import 'emoji-mart/css/emoji-mart.css';
import '../../../../styles/ChatFooter.css';
import '../../../../styles/EmojiPicker.css';
import data from 'emoji-mart/data/facebook.json';
import CloseIcon from '@mui/icons-material/Close';
import PubSub from 'pubsub-js';
import FileInput from '../../../FileInput';
import {
	getSelectionHtml,
	sanitize,
	translateHTMLInputToText,
} from '../../../../helpers/Helpers';
import VoiceRecord from './VoiceRecord';
import {
	EMOJI_SET,
	EMOJI_SHEET_SIZE,
	EMPTY_IMAGE_BASE64,
	EVENT_TOPIC_EMOJI_PICKER_VISIBILITY,
	EVENT_TOPIC_REQUEST_MIC_PERMISSION,
} from '../../../../Constants';
import ChatMessageModel from '../../../../api/models/ChatMessageModel';
import { replaceEmojis } from '../../../../helpers/EmojiHelper';
import { useTranslation } from 'react-i18next';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import ContactsModal from '../../../ContactsModal';

function ChatFooter(props) {
	const { t } = useTranslation();

	const fileInput = useRef(null);
	const editable = useRef(null);

	const [isEmojiPickerVisible, setEmojiPickerVisible] = useState(false);
	const [isMoreVisible, setMoreVisible] = useState(false);
	const [contactsModalVisible, setContactsModalVisible] = useState(false);

	const [isRecording, setRecording] = useState(false);

	const handleAttachmentClick = (acceptValue) => {
		props.setAccept(acceptValue);

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
			props.setInput(event.target.innerHTML);
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
		// Clear editable div when message is sent
		if (props.input === '') {
			editable.current.innerHTML = '';
		}
	}, [editable, props.input]);

	const toggleTemplateMessages = () => {
		// If messages container is already scrolled to bottom
		/*const elem = messagesContainer.current;
        const offset = 5;

        let willScroll = false;
        if (elem.offsetHeight + elem.scrollTop >= (elem.scrollHeight - offset)) {
            willScroll = true;
        }*/

		// Hide saved responses first
		props.setSavedResponsesVisible(false);

		props.setTemplateMessagesVisible((prevState) => !prevState);
	};

	const toggleSavedResponses = () => {
		// Hide template messages first
		props.setTemplateMessagesVisible(false);

		props.setSavedResponsesVisible((prevState) => !prevState);
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
		props.setInput(el.innerHTML);
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

	const handleFocus = (event) => {
		if (props.isExpired) {
			event.target.blur();
			props.setTemplateMessagesVisible(true);
			return;
		}

		if (isRecording) {
			event.target.blur();
		}
	};

	const hasInput = () => {
		return props.input && props.input.length > 0;
	};

	const showMore = () => {
		setEmojiPickerVisible(false);
		setMoreVisible(true);
	};

	const hideMore = () => {
		props.setTemplateMessagesVisible(false);
		setMoreVisible(false);
	};

	const openContactsModal = () => {
		setContactsModalVisible(true);
	};

	const closeContactsModal = () => {
		setContactsModalVisible(false);
	};

	const ACCEPT_IMAGE_AND_VIDEO =
		'image/jpeg, image/png, image/webp, video/mp4, video/3gpp';
	const ACCEPT_DOCUMENT = '*.*';

	return (
		<div
			className="chat__footerOuter"
			onDrop={(event) => event.preventDefault()}
		>
			{isEmojiPickerVisible && (
				<div className="chat__footer__emojiPicker">
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
				sendMessage={props.sendMessage}
				recipientWaId={props.waId}
			/>

			<div className="chat__footer">
				{!props.isExpired && (
					<Tooltip title={t('Emoji')} placement="top">
						<IconButton
							className={isEmojiPickerVisible ? 'activeIconButton' : ''}
							onClick={() => setEmojiPickerVisible((prevState) => !prevState)}
						>
							<InsertEmoticon />
						</IconButton>
					</Tooltip>
				)}

				{!props.isExpired && (
					<div className="chat__footer__attachmentContainer desktopOnly">
						<Tooltip title={t('Attachment')} placement="right">
							<IconButton>
								<AttachFile />
							</IconButton>
						</Tooltip>

						<div className="chat__footer__attachmentContainer__options">
							<Tooltip title={t('Contacts')} placement="right">
								<IconButton
									className="chat__footer__attachmentContainer__options__document"
									onClick={openContactsModal}
								>
									<ContactsIcon />
								</IconButton>
							</Tooltip>

							<Tooltip title={t('Documents')} placement="right">
								<IconButton
									className="chat__footer__attachmentContainer__options__document"
									onClick={() => handleAttachmentClick(ACCEPT_DOCUMENT)}
								>
									<InsertDriveFileIcon />
								</IconButton>
							</Tooltip>

							<Tooltip title={t('Images & Videos')} placement="right">
								<IconButton
									className="chat__footer__attachmentContainer__options__imageAndVideo"
									onClick={() => handleAttachmentClick(ACCEPT_IMAGE_AND_VIDEO)}
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
					className={!props.isExpired ? 'desktopOnly' : ''}
				>
					<IconButton
						data-test-id="templates-button"
						onClick={toggleTemplateMessages}
						className={
							props.isTemplateMessagesVisible ? 'activeIconButton' : ''
						}
					>
						<SmsIcon />
					</IconButton>
				</Tooltip>

				{!props.isExpired && (
					<Tooltip
						title="Saved Responses"
						placement="top"
						className="desktopOnly"
					>
						<IconButton
							onClick={toggleSavedResponses}
							className={
								props.isSavedResponsesVisible ? 'activeIconButton' : ''
							}
						>
							<NotesIcon />
						</IconButton>
					</Tooltip>
				)}

				<div className="hidden">
					<FileInput
						innerRef={fileInput}
						handleSelectedFiles={(files) =>
							props.setSelectedFiles({ ...files })
						}
					/>
				</div>

				<form>
					<div className={'typeBox ' + (props.isExpired ? 'expired' : '')}>
						{!props.input && (
							<div className="typeBox__hint">
								{props.isExpired ? (
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
							className="typeBox__editable"
							contentEditable="true"
							onFocus={(event) => handleFocus(event)}
							onPaste={(event) => handlePaste(event)}
							onCopy={(event) => handleCopy(event)}
							onDrop={(event) => event.preventDefault()}
							spellCheck="true"
							onInput={(event) => handleEditableChange(event)}
							onKeyDown={(e) => {
								if (e.keyCode === 13 && !e.shiftKey) props.sendMessage(true, e);
							}}
						/>
					</div>
					<button onClick={(e) => props.sendMessage(true, e)} type="submit">
						{t('Send a message')}
					</button>
				</form>

				{!hasInput() && !props.isExpired && (
					<div className="mobileOnly">
						<Tooltip title={t('More')}>
							<IconButton
								className="chat_footer__moreButton"
								onClick={showMore}
							>
								<Add />
							</IconButton>
						</Tooltip>
					</div>
				)}

				{hasInput() && (
					<Tooltip title={t('Send')} placement="top">
						<IconButton
							onClick={(e) => props.sendMessage(true, e)}
							data-test-id="send-message-button"
						>
							<Send />
						</IconButton>
					</Tooltip>
				)}

				{hasInput() && (
					<Tooltip title={t('Bulk Send')} placement="top">
						<IconButton
							onClick={() => props.bulkSendMessage(ChatMessageModel.TYPE_TEXT)}
						>
							<DynamicFeedIcon />
						</IconButton>
					</Tooltip>
				)}

				{!props.isExpired && !hasInput() && !isRecording && (
					<Tooltip title={t('Voice')} placement="top">
						<IconButton
							onClick={() =>
								PubSub.publish(EVENT_TOPIC_REQUEST_MIC_PERMISSION, 'chat')
							}
						>
							<MicIcon />
						</IconButton>
					</Tooltip>
				)}

				<div className={!isRecording ? 'hidden' : ''}>
					<VoiceRecord
						voiceRecordCase="chat"
						setRecording={setRecording}
						sendHandledChosenFiles={props.sendHandledChosenFiles}
					/>
				</div>
			</div>

			{isMoreVisible && (
				<div className="chat__footerMore">
					<IconButton onClick={hideMore}>
						<CloseIcon />
					</IconButton>

					<IconButton onClick={() => handleAttachmentClick(ACCEPT_DOCUMENT)}>
						<InsertDriveFileIcon />
					</IconButton>

					<IconButton
						onClick={() => handleAttachmentClick(ACCEPT_IMAGE_AND_VIDEO)}
					>
						<ImageIcon />
					</IconButton>

					<IconButton
						onClick={toggleTemplateMessages}
						className={
							props.isTemplateMessagesVisible ? 'activeIconButton' : ''
						}
					>
						<SmsIcon />
					</IconButton>

					<IconButton
						onClick={toggleSavedResponses}
						className={props.isSavedResponsesVisible ? 'activeIconButton' : ''}
					>
						<NotesIcon />
					</IconButton>
				</div>
			)}

			<Zoom in={props.isScrollButtonVisible}>
				<Badge
					className="chat__scrollButtonWrapper"
					color="primary"
					overlap="rectangular"
					badgeContent={props.currentNewMessages}
					invisible={props.currentNewMessages === 0}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
				>
					<Fab
						onClick={props.handleScrollButtonClick}
						className="chat__scrollButton"
						size="small"
					>
						<ArrowDownward />
					</Fab>
				</Badge>
			</Zoom>
		</div>
	);
}

export default ChatFooter;
