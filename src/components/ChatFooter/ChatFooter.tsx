import React, { useEffect, useRef, useState } from 'react';
import {
	ArrowDownward,
	AttachFile,
	Mood as InsertEmoticon,
	Send,
} from '@src/components/icons';
import SmsIcon from '@src/components/icons/Sms';
import TryIcon from '@src/components/icons/Reviews';
import ImageIcon from '@src/components/icons/Image';
import InsertDriveFileIcon from '@src/components/icons/Draft';
import ContactsIcon from '@src/components/icons/Contacts';
import LocationOnIcon from '@src/components/icons/LocationOn';
import NotesIcon from '@src/components/icons/Notes';
import MicIcon from '@src/components/icons/Mic';
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
import KeyboardCommandKeyIcon from '@src/components/icons/KeyboardCommandKey';
import useChatFooter from '@src/components/ChatFooter/useChatFooter';
import { useIsUserActionsRestricted } from '@src/hooks/useIsUserActionsRestricted';
import ChosenFileList from '@src/interfaces/ChosenFileList';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setState, toggleState } from '@src/store/reducers/UIReducer';
import { SimpleTooltip } from '@src/components/ui/tooltip';
import { Badge } from '@src/components/ui/badge';
import { zoomTransition } from '@src/styles/zoomTransition';
import { cn } from '@src/lib/utils';
import { Button } from '@src/components/ui/button';

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

interface FooterActionButtonProps extends React.ComponentProps<typeof Button> {
	/** Its panel or menu is open */
	isActive?: boolean;
}

// MUI's small IconButton (5px padding) around a 20px icon: a 30px circle,
// lifted onto white while its panel is open
const FooterActionButton: React.FC<FooterActionButtonProps> = ({
	isActive = false,
	className,
	...props
}) => (
	<Button
		variant="ghost"
		color="neutral"
		size="icon-sm"
		className={cn(
			'size-7.5 rounded-full transition-all duration-200 ease-in [&_.app-icon]:size-5! [&_.app-icon]:text-chat-icon! [&_.app-icon]:transition-colors [&_.app-icon]:duration-200 [&_.app-icon]:ease-in',
			isActive &&
				'bg-white! shadow-[0_4px_5px_-6px_rgba(0,0,45,0.4)] [&_.app-icon]:text-chat-icon-dark!',
			className
		)}
		{...props}
	/>
);

// A thin divider between groups of footer buttons
const ActionSeparator: React.FC = () => (
	<div className="mx-1.25 h-5 w-px bg-black/10" />
);

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
		<div
			className="relative flex flex-col border-l border-[lightgray] max-md:border-l-0"
			onDrop={(event: React.DragEvent) => event.preventDefault()}
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
				<div className="m-2.5 flex-1 rounded-[10px] bg-white">
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

			<LocationModal
				open={locationModalVisible}
				onClose={() => setLocationModalVisible(false)}
				sendMessage={(payload, onSuccess) =>
					sendMessage(false, undefined, payload, onSuccess)
				}
				recipientWaId={waId}
			/>

			<div className="flex-1">
				<div
					className={cn(
						'flex max-h-100 justify-between px-2.5 transition-all duration-500 ease-out',
						isExpired ? 'h-auto! flex-col [align-items:normal]' : 'items-center'
					)}
				>
					<form className="flex flex-1">
						<div
							className={cn(
								'relative mb-1.25 h-auto flex-1 overflow-hidden rounded-[12px] border-none transition-[box-shadow,background-color] duration-200 ease-out focus:border-none focus:outline-none',
								isExpired
									? 'bg-[#f2edea] shadow-none'
									: 'bg-white shadow-[var(--shadow-sm),0_0_0_1px_rgba(94,56,38,0.06)] focus-within:shadow-[var(--shadow-sm),0_0_0_1px_var(--color-primary),0_0_0_4px_rgba(101,203,172,0.2)]'
							)}
						>
							{translateHTMLInputToText(input).trim() === '' && (
								<div
									className={cn(
										'absolute z-0 w-full truncate py-2 pr-6.25 pl-3.75',
										isExpired ? 'text-[#736054]' : 'text-[#9c8173]'
									)}
								>
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
								// The transparent outline beats the app's global
								// :focus-visible one
								className="relative z-100 max-h-[250px] min-h-[26px] w-full overflow-y-auto px-3.75 py-2 [word-break:break-word] [outline:1px_solid_transparent]! max-md:max-h-40"
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
						</div>
						<button
							onClick={(e: React.MouseEvent) => sendMessage(true, e)}
							type="submit"
							style={{ display: 'none' }}
						>
							{t('Send a message')}
						</button>
					</form>
				</div>
			</div>

			<div className="flex gap-[7px] px-2.5 pt-1.25 pb-2.5">
				<div className="flex items-center gap-[7px]">
					<SimpleTooltip
						title={t('Quick Actions')}
						side="top"
						disableHoverableContent
					>
						<FooterActionButton
							isActive={isQuickActionsMenuVisible}
							onClick={displayQuickActionsMenu}
						>
							<KeyboardCommandKeyIcon />
						</FooterActionButton>
					</SimpleTooltip>

					{!(isUserActionsRestricted && isExpired) && <ActionSeparator />}

					{!isUserActionsRestricted && (
						<SimpleTooltip
							title={t('Templates')}
							side="top"
							disableHoverableContent
						>
							<FooterActionButton
								data-test-id="templates-button"
								onClick={toggleTemplateMessages}
								isActive={isTemplatesVisible}
							>
								<SmsIcon />
							</FooterActionButton>
						</SimpleTooltip>
					)}

					{!isExpired && !isUserActionsRestricted && (
						<SimpleTooltip
							title={t('Interactive Messages')}
							side="top"
							disableHoverableContent
						>
							<FooterActionButton
								onClick={toggleInteractiveMessages}
								isActive={isInteractiveMessagesVisible}
								className={cn(isAttachmentOptionsVisible && 'max-md:hidden')}
							>
								<TryIcon />
							</FooterActionButton>
						</SimpleTooltip>
					)}

					{!isExpired && (
						<SimpleTooltip
							title={t('Quick Replies')}
							side="top"
							disableHoverableContent
						>
							<FooterActionButton
								onClick={toggleSavedResponses}
								isActive={isSavedResponsesVisible}
								className={cn(isAttachmentOptionsVisible && 'max-md:hidden')}
							>
								<NotesIcon />
							</FooterActionButton>
						</SimpleTooltip>
					)}

					{!isExpired && <ActionSeparator />}

					{!isExpired && (
						<SimpleTooltip
							title={t('Emoji')}
							side="top"
							disableHoverableContent
						>
							<FooterActionButton
								isActive={isEmojiPickerVisible}
								onClick={toggleEmojiPicker}
							>
								<InsertEmoticon />
							</FooterActionButton>
						</SimpleTooltip>
					)}

					{!isExpired && (
						<div
							className={cn(
								'flex gap-1.25 rounded-[20px]',
								isAttachmentOptionsVisible && 'bg-black/5'
							)}
						>
							<SimpleTooltip
								title={t('Attachment')}
								side="top"
								disableHoverableContent
							>
								<FooterActionButton
									isActive={isAttachmentOptionsVisible}
									onClick={() =>
										setAttachmentOptionsVisible(!isAttachmentOptionsVisible)
									}
								>
									<AttachFile />
								</FooterActionButton>
							</SimpleTooltip>

							{isAttachmentOptionsVisible && (
								<div className="ml-1.25 flex animate-grow-in gap-[7px] max-md:ml-0">
									<SimpleTooltip
										title={t('Images & Videos')}
										side="top"
										disableHoverableContent
									>
										<FooterActionButton
											onClick={() =>
												handleAttachmentClick(ACCEPT_IMAGE_AND_VIDEO)
											}
										>
											<ImageIcon />
										</FooterActionButton>
									</SimpleTooltip>

									<SimpleTooltip
										title={t('Documents')}
										side="top"
										disableHoverableContent
									>
										<FooterActionButton
											onClick={() => handleAttachmentClick(ACCEPT_DOCUMENT)}
										>
											<InsertDriveFileIcon />
										</FooterActionButton>
									</SimpleTooltip>

									<SimpleTooltip
										title={t('Contacts')}
										side="top"
										disableHoverableContent
									>
										<FooterActionButton onClick={openContactsModal}>
											<ContactsIcon />
										</FooterActionButton>
									</SimpleTooltip>

									<SimpleTooltip
										title={t('Location')}
										side="top"
										disableHoverableContent
									>
										<FooterActionButton
											onClick={() => setLocationModalVisible(true)}
										>
											<LocationOnIcon />
										</FooterActionButton>
									</SimpleTooltip>
								</div>
							)}
						</div>
					)}
				</div>

				<div className="flex flex-1 items-center justify-end gap-[7px]">
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
							<FooterActionButton
								onClick={() =>
									PubSub.publish(EVENT_TOPIC_REQUEST_MIC_PERMISSION, 'chat')
								}
							>
								<MicIcon />
							</FooterActionButton>
						</SimpleTooltip>
					)}

					{hasInput() && (
						<SimpleTooltip title={t('Send')} side="top" disableHoverableContent>
							<FooterActionButton
								onClick={(e: React.MouseEvent) => sendMessage(true, e)}
								data-test-id="send-message-button"
							>
								<Send />
							</FooterActionButton>
						</SimpleTooltip>
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

			{/* Holds the scroll button and its unread count badge, as MUI's Badge
			did, on MUI's Fab layer so it floats over the messages */}
			<span
				className={cn(
					'absolute right-5 bottom-28 z-1050 inline-flex',
					zoomTransition(isScrollButtonVisible)
				)}
			>
				{/* MUI's small Fab: a raised round 40px button */}
				<Button
					variant="ghost"
					color="neutral"
					size="icon-lg"
					className="rounded-full bg-white! shadow-[0px_3px_5px_-1px_rgba(0,0,0,0.2),0px_6px_10px_0px_rgba(0,0,0,0.14),0px_1px_18px_0px_rgba(0,0,0,0.12)] [&_.app-icon]:size-6! [&_.app-icon]:text-(--color-primary-light)!"
					onClick={handleScrollButtonClick}
				>
					<ArrowDownward />
				</Button>
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
			</span>
		</div>
	);
};

export default ChatFooter;
