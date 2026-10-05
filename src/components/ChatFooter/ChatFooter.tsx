import React, { useEffect, useRef, useState } from 'react';
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
import LocationOnIcon from '@mui/icons-material/LocationOn';
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
import LocationModal from '../LocationModal';
import data from 'emoji-mart/data/facebook.json';
import QuickActionsMenu from '@src/components/QuickActionsMenu';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import useChatFooter from '@src/components/ChatFooter/useChatFooter';
import { useIsUserActionsRestricted } from '@src/hooks/useIsUserActionsRestricted';
import ChosenFileList from '@src/interfaces/ChosenFileList';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setState, toggleState } from '@src/store/reducers/UIReducer';
import { SimpleTooltip } from '@src/components/ui/tooltip';
import { Badge } from '@src/components/ui/badge';
import { cn } from '@src/lib/utils';
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

	const isUserActionsRestricted = useIsUserActionsRestricted();

	const fileInput = useRef<HTMLInputElement>(null);
	const editable = useRef<HTMLDivElement>(null);

	const [isAttachmentOptionsVisible, setAttachmentOptionsVisible] =
		useState(false);
	const [isEmojiPickerVisible, setEmojiPickerVisible] = useState(false);
	const [contactsModalVisible, setContactsModalVisible] = useState(false);
	const [locationModalVisible, setLocationModalVisible] = useState(false);
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
		<Container onDrop={(event: React.DragEvent) => event.preventDefault()}>
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

			<LocationModal
				open={locationModalVisible}
				onClose={() => setLocationModalVisible(false)}
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
								onPaste={(event: React.ClipboardEvent<HTMLElement>) =>
									handlePaste(event)
								}
								onCopy={(event: React.ClipboardEvent<HTMLDivElement>) =>
									handleCopy(event)
								}
								onDrop={(event: React.DragEvent) => event.preventDefault()}
								spellCheck="true"
								onInput={(event: React.FormEvent<HTMLDivElement>) =>
									handleEditableChange(event)
								}
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
					<SimpleTooltip
						title={t('Quick Actions')}
						side="top"
						disableHoverableContent
					>
						<CommandActionIcon
							className={isQuickActionsMenuVisible ? 'active' : ''}
							onClick={displayQuickActionsMenu}
						>
							<KeyboardCommandKeyIcon />
						</CommandActionIcon>
					</SimpleTooltip>

					{!(isUserActionsRestricted && isExpired) && <ActionSeparator />}

					{!isUserActionsRestricted && (
						<SimpleTooltip
							title={t('Templates')}
							side="top"
							disableHoverableContent
						>
							<ActionIcon
								data-test-id="templates-button"
								onClick={toggleTemplateMessages}
								className={isTemplatesVisible ? 'active' : ''}
							>
								<SmsIcon />
							</ActionIcon>
						</SimpleTooltip>
					)}

					{!isExpired && !isUserActionsRestricted && (
						<SimpleTooltip
							title={t('Interactive Messages')}
							side="top"
							disableHoverableContent
						>
							<ActionIcon
								onClick={toggleInteractiveMessages}
								className={cn(
									isAttachmentOptionsVisible && 'desktopOnly',
									isInteractiveMessagesVisible && 'active'
								)}
							>
								<TryIcon />
							</ActionIcon>
						</SimpleTooltip>
					)}

					{!isExpired && (
						<SimpleTooltip
							title={t('Quick Replies')}
							side="top"
							disableHoverableContent
						>
							<ActionIcon
								onClick={toggleSavedResponses}
								className={cn(
									isAttachmentOptionsVisible && 'desktopOnly',
									isSavedResponsesVisible && 'active'
								)}
							>
								<NotesIcon />
							</ActionIcon>
						</SimpleTooltip>
					)}

					{!isExpired && <ActionSeparator />}

					{!isExpired && (
						<SimpleTooltip
							title={t('Emoji')}
							side="top"
							disableHoverableContent
						>
							<ActionIcon
								className={isEmojiPickerVisible ? 'active' : ''}
								onClick={toggleEmojiPicker}
							>
								<InsertEmoticon />
							</ActionIcon>
						</SimpleTooltip>
					)}

					{!isExpired && (
						<AttachmentContainer
							className={isAttachmentOptionsVisible ? 'open' : ''}
						>
							<SimpleTooltip
								title={t('Attachment')}
								side="top"
								disableHoverableContent
							>
								<ActionIcon
									className={isAttachmentOptionsVisible ? 'active' : ''}
									onClick={() =>
										setAttachmentOptionsVisible(!isAttachmentOptionsVisible)
									}
								>
									<AttachFile />
								</ActionIcon>
							</SimpleTooltip>

							{isAttachmentOptionsVisible && (
								<AttachmentOptions className="animate-grow-in">
									<SimpleTooltip
										title={t('Images & Videos')}
										side="top"
										disableHoverableContent
									>
										<AttachmentOptionImageAndVideo
											onClick={() =>
												handleAttachmentClick(ACCEPT_IMAGE_AND_VIDEO)
											}
										>
											<ImageIcon />
										</AttachmentOptionImageAndVideo>
									</SimpleTooltip>

									<SimpleTooltip
										title={t('Documents')}
										side="top"
										disableHoverableContent
									>
										<AttachmentOptionDocument
											onClick={() => handleAttachmentClick(ACCEPT_DOCUMENT)}
										>
											<InsertDriveFileIcon />
										</AttachmentOptionDocument>
									</SimpleTooltip>

									<SimpleTooltip
										title={t('Contacts')}
										side="top"
										disableHoverableContent
									>
										<ActionIcon onClick={openContactsModal}>
											<ContactsIcon />
										</ActionIcon>
									</SimpleTooltip>

									<SimpleTooltip
										title={t('Location')}
										side="top"
										disableHoverableContent
									>
										<ActionIcon onClick={() => setLocationModalVisible(true)}>
											<LocationOnIcon />
										</ActionIcon>
									</SimpleTooltip>
								</AttachmentOptions>
							)}
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
						<SimpleTooltip
							title={t('Voice')}
							side="top"
							disableHoverableContent
						>
							<ActionIcon
								onClick={() =>
									PubSub.publish(EVENT_TOPIC_REQUEST_MIC_PERMISSION, 'chat')
								}
							>
								<MicIcon />
							</ActionIcon>
						</SimpleTooltip>
					)}

					{hasInput() && (
						<SimpleTooltip title={t('Send')} side="top" disableHoverableContent>
							<ActionIcon
								onClick={(e: React.MouseEvent) => sendMessage(true, e)}
								data-test-id="send-message-button"
							>
								<Send />
							</ActionIcon>
						</SimpleTooltip>
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

			{/* Stays mounted like MUI's Zoom did; zooms in each time it shows */}
			<ScrollButtonWrapper
				className={
					isScrollButtonVisible ? 'animate-in zoom-in duration-225' : 'hidden!'
				}
			>
				<ScrollButton onClick={handleScrollButtonClick}>
					<ArrowDownward />
				</ScrollButton>
				{currentNewMessages !== 0 && (
					<Badge
						variant="solid"
						color="primary"
						size="sm"
						className="absolute top-[3px] left-[3px] z-1 min-w-5 -translate-x-1/2 -translate-y-1/2"
					>
						{currentNewMessages > 99 ? '99+' : currentNewMessages}
					</Badge>
				)}
			</ScrollButtonWrapper>
		</Container>
	);
};

export default ChatFooter;
