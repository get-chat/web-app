import React, { useEffect, useRef, useState } from 'react';
import { Grow, Tooltip, Zoom } from '@mui/material';
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
import 'emoji-mart/css/emoji-mart.css';
import '../../styles/EmojiPicker.css';
import PubSub from 'pubsub-js';
import FileInput from '../FileInput';
import { translateHTMLInputToText } from '@src/helpers/Helpers';
import VoiceRecord from '../VoiceRecord';
import {
	EMOJI_SET,
	EMOJI_SHEET_SIZE,
	EVENT_TOPIC_EMOJI_PICKER_VISIBILITY,
	EVENT_TOPIC_FOCUS_MESSAGE_INPUT,
	EVENT_TOPIC_REQUEST_MIC_PERMISSION,
} from '@src/Constants';
import { replaceEmojis } from '@src/helpers/EmojiHelper';
import { useTranslation } from 'react-i18next';
import ContactsModal from '../ContactsModal';
import data from 'emoji-mart/data/facebook.json';
import QuickActionsMenu from '@src/components/QuickActionsMenu';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import useChatFooter from '@src/components/ChatFooter/useChatFooter';
import ChosenFileList from '@src/interfaces/ChosenFileList';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setState, toggleState } from '@src/store/reducers/UIReducer';
import {
	ActionIcon,
	ActionSeparator,
	ActionsRow,
	ActionsRowLeft,
	ActionsRowRight,
	AttachmentContainer,
	AttachmentOptionDocument,
	AttachmentOptionImageAndVideo,
	AttachmentOptions,
	CommandActionIcon,
	Container,
	EmojiPickerContainer,
	Footer,
	Row,
	ScrollButton,
	ScrollButtonWrapper,
	TypeBox,
	TypeBoxEditable,
	TypeBoxHint,
} from './ChatFooter.styles';

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
	setSelectedFiles: (value: any) => void;
	accept: string;
	setAccept: (value: string) => void;
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
	setSelectedFiles,
	accept,
	setAccept,
	sendHandledChosenFiles,
	isScrollButtonVisible,
	handleScrollButtonClick,
	processCommand,
}) => {
	const { t } = useTranslation();

	const dispatch = useAppDispatch();

	const {
		isTemplatesVisible,
		isSavedResponsesVisible,
		isInteractiveMessagesVisible,
	} = useAppSelector((state) => state.UI);

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

	// Track waId to detect chat switches (for draft restoration)
	const prevWaIdRef = useRef<string | undefined>(undefined);
	const prevInputRef = useRef(input);

	useEffect(() => {
		if (editable.current) {
			const waIdChanged = prevWaIdRef.current !== waId;
			const inputCleared = prevInputRef.current !== '' && input === '';
			// Also detect when input goes from empty to non-empty (draft restored after initial render)
			const inputRestored =
				prevInputRef.current === '' &&
				input !== '' &&
				editable.current.innerHTML === '';

			// Only update innerHTML when:
			// 1. waId changed (draft restoration when switching chats)
			// 2. input was cleared (message sent or cleared externally)
			// 3. input was restored (draft loaded after initial render)
			if (waIdChanged || inputCleared || inputRestored) {
				editable.current.innerHTML = input;

				// Move cursor to the end if there is actual text content
				const textContent = translateHTMLInputToText(input);
				if (textContent && textContent.trim().length > 0) {
					const moveCursorToEnd = () => {
						try {
							const el = editable.current;
							if (!el) return;

							// Focus is required for the cursor to be visible and correctly placed
							el.focus();

							const range = document.createRange();
							const selection = window.getSelection();

							if (selection) {
								range.selectNodeContents(el);
								range.collapse(false);
								selection.removeAllRanges();
								selection.addRange(range);
							}
						} catch (e) {
							console.warn('Failed to move cursor to end', e);
						}
					};

					// Execute immediately
					moveCursorToEnd();
					// And also on next tick to ensure DOM is ready
					setTimeout(moveCursorToEnd, 10);
				}
			}
		}
		prevWaIdRef.current = waId;
		prevInputRef.current = input;
	}, [editable, input, waId]);

	const toggleTemplateMessages = () => {
		// If messages container is already scrolled to bottom
		/*const elem = messagesContainer.current;
		const offset = 5;

		let willScroll = false;
		if (elem.offsetHeight + elem.scrollTop >= (elem.scrollHeight - offset)) {
			willScroll = true;
		}*/

		if (!isTemplatesVisible) {
			setAttachmentOptionsVisible(false);
			dispatch(
				setState({
					isSavedResponsesVisible: false,
					isInteractiveMessagesVisible: false,
				})
			);
			setEmojiPickerVisible(false);
		}

		dispatch(toggleState('isTemplatesVisible'));
	};

	const toggleInteractiveMessages = () => {
		if (!isInteractiveMessagesVisible) {
			dispatch(
				setState({ isTemplatesVisible: false, isSavedResponsesVisible: false })
			);
			setAttachmentOptionsVisible(false);
			setEmojiPickerVisible(false);
		}

		dispatch(toggleState('isInteractiveMessagesVisible'));
	};

	const toggleSavedResponses = () => {
		if (!isSavedResponsesVisible) {
			setAttachmentOptionsVisible(false);
			dispatch(
				setState({
					isTemplatesVisible: false,
					isInteractiveMessagesVisible: false,
				})
			);
			setEmojiPickerVisible(false);
		}

		dispatch(toggleState('isSavedResponsesVisible'));
	};

	const toggleEmojiPicker = () => {
		setEmojiPickerVisible((prevState) => {
			if (!prevState) {
				dispatch(
					setState({
						isTemplatesVisible: false,
						isSavedResponsesVisible: false,
					})
				);
				setAttachmentOptionsVisible(false);
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
			dispatch(
				setState({ isTemplatesVisible: false, isSavedResponsesVisible: false })
			);
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
		<Container onDrop={(event) => event.preventDefault()}>
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
				<EmojiPickerContainer>
					<NimblePicker
						set={EMOJI_SET}
						sheetSize={EMOJI_SHEET_SIZE}
						data={data}
						showPreview={false}
						emojiSize={32}
						onSelect={handleEmojiSelect}
					/>
				</EmojiPickerContainer>
			)}

			<ContactsModal
				open={contactsModalVisible}
				onClose={closeContactsModal}
				sendMessage={(payload, onSuccess) =>
					sendMessage(false, undefined, payload, onSuccess)
				}
				recipientWaId={waId}
			/>

			<Row>
				<Footer className={isExpired ? 'expired' : ''}>
					<form>
						<TypeBox className={isExpired ? 'expired' : ''}>
							{translateHTMLInputToText(input).trim() === '' && (
								<TypeBoxHint>
									{isExpired ? (
										<span>
											{t(
												'This chat has expired. You need to answer with template messages.'
											)}
										</span>
									) : (
										<span>{t('Type a message')}</span>
									)}
								</TypeBoxHint>
							)}
							<TypeBoxEditable
								id="typeBox__editable"
								ref={editable}
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
						</TypeBox>
						<button
							onClick={(e: React.MouseEvent) => sendMessage(true, e)}
							type="submit"
							style={{ display: 'none' }}
						>
							{t('Send a message')}
						</button>
					</form>
				</Footer>
			</Row>

			<ActionsRow>
				<ActionsRowLeft>
					<Tooltip
						title={t('Quick Actions')}
						placement="top"
						disableInteractive
					>
						<CommandActionIcon
							className={isQuickActionsMenuVisible ? 'active' : ''}
							onClick={displayQuickActionsMenu}
							size="small"
						>
							<KeyboardCommandKeyIcon />
						</CommandActionIcon>
					</Tooltip>

					<ActionSeparator />

					<Tooltip title={t('Templates')} placement="top" disableInteractive>
						<ActionIcon
							data-test-id="templates-button"
							onClick={toggleTemplateMessages}
							className={isTemplatesVisible ? 'active' : ''}
							size="small"
						>
							<SmsIcon />
						</ActionIcon>
					</Tooltip>

					{!isExpired && (
						<Tooltip
							title={t('Interactive Messages')}
							placement="top"
							disableInteractive
							className={isAttachmentOptionsVisible ? 'desktopOnly' : ''}
						>
							<ActionIcon
								onClick={toggleInteractiveMessages}
								className={isInteractiveMessagesVisible ? 'active' : ''}
								size="small"
							>
								<TryIcon />
							</ActionIcon>
						</Tooltip>
					)}

					{!isExpired && (
						<Tooltip
							title={t('Saved Responses')}
							placement="top"
							className={isAttachmentOptionsVisible ? 'desktopOnly' : ''}
							disableInteractive
						>
							<ActionIcon
								onClick={toggleSavedResponses}
								className={isSavedResponsesVisible ? 'active' : ''}
								size="small"
							>
								<NotesIcon />
							</ActionIcon>
						</Tooltip>
					)}

					{!isExpired && <ActionSeparator />}

					{!isExpired && (
						<Tooltip title={t('Emoji')} placement="top" disableInteractive>
							<ActionIcon
								className={isEmojiPickerVisible ? 'active' : ''}
								onClick={toggleEmojiPicker}
								size="small"
							>
								<InsertEmoticon />
							</ActionIcon>
						</Tooltip>
					)}

					{!isExpired && (
						<AttachmentContainer
							className={isAttachmentOptionsVisible ? 'open' : ''}
						>
							<Tooltip
								title={t('Attachment')}
								placement="top"
								disableInteractive
							>
								<ActionIcon
									className={isAttachmentOptionsVisible ? 'active' : ''}
									size="small"
									onClick={() =>
										setAttachmentOptionsVisible(!isAttachmentOptionsVisible)
									}
								>
									<AttachFile />
								</ActionIcon>
							</Tooltip>

							<Grow in={isAttachmentOptionsVisible} unmountOnExit>
								<AttachmentOptions>
									<Tooltip
										title={t('Images & Videos')}
										placement="top"
										disableInteractive
									>
										<AttachmentOptionImageAndVideo
											onClick={() =>
												handleAttachmentClick(ACCEPT_IMAGE_AND_VIDEO)
											}
											size="small"
										>
											<ImageIcon />
										</AttachmentOptionImageAndVideo>
									</Tooltip>

									<Tooltip
										title={t('Documents')}
										placement="top"
										disableInteractive
									>
										<AttachmentOptionDocument
											onClick={() => handleAttachmentClick(ACCEPT_DOCUMENT)}
											size="small"
										>
											<InsertDriveFileIcon />
										</AttachmentOptionDocument>
									</Tooltip>

									<Tooltip
										title={t('Contacts')}
										placement="top"
										disableInteractive
									>
										<ActionIcon onClick={openContactsModal} size="small">
											<ContactsIcon />
										</ActionIcon>
									</Tooltip>
								</AttachmentOptions>
							</Grow>
						</AttachmentContainer>
					)}
				</ActionsRowLeft>

				<ActionsRowRight>
					<div className={!isRecording ? 'hidden' : ''}>
						<VoiceRecord
							voiceRecordCase="chat"
							setRecording={setRecording}
							sendHandledChosenFiles={sendHandledChosenFiles}
						/>
					</div>

					{!isExpired && !hasInput() && !isRecording && (
						<Tooltip title={t('Voice')} placement="top" disableInteractive>
							<ActionIcon
								onClick={() =>
									PubSub.publish(EVENT_TOPIC_REQUEST_MIC_PERMISSION, 'chat')
								}
								size="small"
							>
								<MicIcon />
							</ActionIcon>
						</Tooltip>
					)}

					{hasInput() && (
						<Tooltip title={t('Send')} placement="top" disableInteractive>
							<ActionIcon
								onClick={(e) => sendMessage(true, e)}
								data-test-id="send-message-button"
								size="small"
							>
								<Send />
							</ActionIcon>
						</Tooltip>
					)}
				</ActionsRowRight>
			</ActionsRow>

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
				<ScrollButtonWrapper
					color="primary"
					overlap="rectangular"
					badgeContent={currentNewMessages}
					invisible={currentNewMessages === 0}
					anchorOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
				>
					<ScrollButton onClick={handleScrollButtonClick} size="small">
						<ArrowDownward />
					</ScrollButton>
				</ScrollButtonWrapper>
			</Zoom>
		</Container>
	);
};

export default ChatFooter;
