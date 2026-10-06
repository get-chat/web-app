import React from 'react';
import DoneIcon from '@src/components/icons/Check';
import ErrorIcon from '@src/components/icons/Error';
import AccessTimeIcon from '@src/components/icons/Schedule';
import Moment from 'react-moment';
import NoteIcon from '@src/components/icons/StickyNote2';
import ExpandMoreIcon from '@src/components/icons/KeyboardArrowDown';
import MessageDateIndicator from '../MessageDateIndicator';
import ContextChatMessage from './ContextChatMessage';
import ReplyIcon from '@src/components/icons/Reply';
import ChatMessageVideo from './ChatMessageVideo';
import ChatMessageImage from './ChatMessageImage';
import ChatMessageDocument from './ChatMessageDocument';
import ChatMessageVoice from './ChatMessageVoice';
import ChatMessageTemplate from './ChatMessageTemplate';
import ChatAssignmentEventView from '../../../ChatAssignmentEventView';
import ChatTaggingEvent from '../../../ChatTaggingEvent';
import ChatMessageLocation from './ChatMessageLocation';
import { useTranslation } from 'react-i18next';
import InteractiveMessage from './InteractiveMessage';
import OrderMessage from './OrderMessage';
import ContactsMessage from './ContactsMessage';
import PrintMessage from '../../../PrintMessage';
import ChatMessageReferral from './ChatMessageReferral';
import { setPreviewMediaObject } from '@src/store/reducers/previewMediaObjectReducer';
import PreviewMediaModel from '../../../../api/models/PreviewMediaModel';
import { ATTACHMENT_TYPE_IMAGE, ATTACHMENT_TYPE_VIDEO } from '@src/Constants';
import { useAppDispatch } from '@src/store/hooks';
import ChatMessageErrors from '@src/components/ChatMessageErrors';
import { clone } from '@src/helpers/ObjectHelper';
import { Mood as InsertEmoticon } from '@src/components/icons';
import useReactions from '@src/hooks/useReactions';
import { setState } from '@src/store/reducers/UIReducer';
import { Template } from '@src/types/templates';
import {
	generateImageLink,
	generateStickerLink,
	generateVideoLink,
	getEchoOriginLabel,
	getMessageCaption,
	getMessageTimestamp,
	getSenderName,
	hasAnyStatus,
	hasMediaToPreview,
	isDeliveredOrRead,
	isJustSent,
	isPending,
	isRead,
	isUnsupportedMessageType,
} from '@src/helpers/MessageHelper';
import { Message, MessageType } from '@src/types/messages';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import MissingContent from './MissingContent';
import DoneAllIcon from '@src/components/icons/DoneAll';
import {
	messageBubbleClassName,
	messageMediaClassName,
	statusIconClassName,
} from './messageBubble';
import { cn } from '@src/lib/utils';

// The round buttons beside a message, shown while it is hovered
const actionClassName =
	'z-3 flex size-6.25 cursor-pointer items-center justify-center rounded-[35px] bg-[rgba(100,86,82,0.4)] transition-all duration-200 ease-out hover:bg-[rgba(100,86,82,0.65)] [&_.app-icon]:size-4.5! [&_.app-icon]:text-white!';

// Each reaction in the pill below a message, and the count after them
const reactionClassName = 'flex items-center gap-1.25 text-[12px] font-medium';

interface Props {
	data: Message;
	reactionsHistory?: Message[];
	templateData?: Template;
	displaySender?: boolean;
	displayDate?: boolean;
	isExpired?: boolean;
	contactProvidersData?: { [key: string]: any };
	onOptionsClick?: (e: React.MouseEvent, data: Message) => void;
	onQuickReactionsClick?: (e: React.MouseEvent, data: Message) => void;
	onReactionDetailsClick?: (e: React.MouseEvent, data: Message) => void;
	goToMessageId?: (msgId: string, timestamp: number) => void;
	retryMessage?: (message: Message) => void;
	disableMediaPreview?: boolean;
	setMessageWithStatuses?: (message?: Message) => void;
	isActionsEnabled?: boolean;
	isInfoClickable?: boolean;
}

const iconStyles = {
	fontSize: '15px',
};

const ChatMessage: React.FC<Props> = ({
	data,
	reactionsHistory,
	templateData,
	displaySender,
	displayDate,
	isExpired,
	contactProvidersData,
	onOptionsClick,
	onQuickReactionsClick,
	onReactionDetailsClick,
	goToMessageId,
	retryMessage,
	disableMediaPreview,
	setMessageWithStatuses,
	isActionsEnabled = false,
	isInfoClickable = true,
}) => {
	const { t } = useTranslation();

	const dispatch = useAppDispatch();

	const { reactions, reactionsWithCount } = useReactions({
		reactionsHistory,
	});

	const echoOriginLabel = getEchoOriginLabel(data);

	const onPreview = (type: string, source: string) => {
		if (!disableMediaPreview) {
			const previewData = new PreviewMediaModel(
				getSenderName(data),
				generateInitialsHelper(getSenderName(data)),
				type,
				source,
				getMessageTimestamp(data) ?? -1
			);

			dispatch(setPreviewMediaObject(previewData));
		}
	};

	const dateFormat = 'H:mm';

	return (
		// chat__message__outer: a hook for ChatView and Chat.css
		<div
			id={'message_' + data.id}
			className="chat__message__outer group/message"
		>
			{displayDate && (
				<MessageDateIndicator timestamp={getMessageTimestamp(data)} />
			)}

			{data.assignment_event && (
				<ChatAssignmentEventView data={data.assignment_event} />
			)}

			{data.tagging_event && <ChatTaggingEvent data={data.tagging_event} />}

			{!data.assignment_event && !data.tagging_event && (
				<div>
					{(displaySender || displayDate) && (
						<div
							className={cn(
								'chat__name mx-2.5 mt-0 mb-0.5 block text-[length:x-small] font-semibold text-ink/75 [&_.emoji-mart-emoji]:size-3! [&_.emoji-mart-emoji]:align-middle',
								data.from_us && 'text-right'
							)}
						>
							{data.from_us
								? echoOriginLabel
									? t(echoOriginLabel)
									: getSenderName(data)
								: contactProvidersData?.[data.waba_payload?.wa_id ?? '']?.[0]
										?.name ?? getSenderName(data)}
						</div>
					)}

					{data.waba_payload?.type === MessageType.sticker && (
						<img
							className={cn(
								messageMediaClassName,
								'mb-[22px] w-auto cursor-default object-contain'
							)}
							src={generateStickerLink(data)}
							alt={getMessageCaption(data) ?? ''}
						/>
					)}

					<div
						className={cn(
							messageBubbleClassName({
								type: data.waba_payload?.type ?? MessageType.none,
								isOutgoing: data.from_us,
								hasMedia: hasMediaToPreview(data),
								hasReaction: reactions.length > 0,
								isSenderHidden: !displaySender && !displayDate,
								isFirstInGroup: displaySender || displayDate,
							}),
							// Dimmed while ChatView points at it (data-blink on the row)
							'group-data-blink/message:opacity-30'
						)}
					>
						{isActionsEnabled && (
							<div
								className={cn(
									'absolute top-1 -mx-2.5 flex gap-1.25 opacity-0 transition-all duration-500 group-hover/message:opacity-100',
									data.from_us
										? 'left-0 -translate-x-full'
										: 'right-0 translate-x-full'
								)}
							>
								{!isExpired && (
									<div
										className={actionClassName}
										onClick={(event) => onQuickReactionsClick?.(event, data)}
									>
										<InsertEmoticon />
									</div>
								)}

								{((data.from_us &&
									data.waba_payload?.type === MessageType.text) ||
									data.waba_payload?.type === MessageType.audio) && (
									<div
										className={actionClassName}
										onClick={(event) => onOptionsClick?.(event, data)}
									>
										<ExpandMoreIcon />
									</div>
								)}
							</div>
						)}

						{data.context?.forwarded && (
							<div className="mb-1.25 flex justify-center text-[12px] text-ink/50">
								<ReplyIcon className="mr-1.25 size-[0.7em]! -scale-x-100 text-ink/30!" />
								<span>{t('Forwarded')}</span>
							</div>
						)}

						{data.context && (
							<ContextChatMessage
								contextMessage={data.context}
								goToMessageId={goToMessageId}
							/>
						)}

						{data.waba_payload?.referral && (
							<ChatMessageReferral
								data={data}
								onPreview={onPreview}
								onOptionsClick={(e: React.MouseEvent) =>
									onOptionsClick?.(e, data)
								}
							/>
						)}

						{data.waba_payload?.type === MessageType.image && (
							<ChatMessageImage
								data={data}
								source={generateImageLink(data)}
								onPreview={() =>
									onPreview(ATTACHMENT_TYPE_IMAGE, generateImageLink(data))
								}
							/>
						)}

						{data.waba_payload?.type === MessageType.video && (
							<ChatMessageVideo
								source={generateVideoLink(data)}
								onPreview={() =>
									onPreview(ATTACHMENT_TYPE_VIDEO, generateVideoLink(data))
								}
								onOptionsClick={(e) => onOptionsClick?.(e, data)}
							/>
						)}

						{(data.waba_payload?.type === MessageType.voice ||
							data.waba_payload?.type === MessageType.audio) && (
							<ChatMessageVoice data={data} />
						)}

						{data.waba_payload?.type === MessageType.document && (
							<ChatMessageDocument data={data} />
						)}

						{data.waba_payload?.type === MessageType.sticker && (
							<span>
								<NoteIcon fontSize="small" />
							</span>
						)}

						{data.waba_payload?.type === MessageType.location && (
							<ChatMessageLocation data={data} />
						)}

						{data.waba_payload?.type === MessageType.template && (
							<ChatMessageTemplate
								data={data}
								templateData={templateData}
								onPreview={onPreview}
								onOptionsClick={(e: React.MouseEvent) =>
									onOptionsClick?.(e, data)
								}
							/>
						)}

						{data.waba_payload?.type === MessageType.interactive && (
							<InteractiveMessage data={data} />
						)}

						{data.waba_payload?.type === MessageType.order && (
							<OrderMessage data={data} />
						)}

						{data.waba_payload?.type === MessageType.contacts && (
							<ContactsMessage data={data} />
						)}

						{isUnsupportedMessageType(data.waba_payload?.type) && (
							<MissingContent>{t('Unsupported message')}</MissingContent>
						)}

						{data.waba_payload?.text?.body ??
						getMessageCaption(data) ??
						data.waba_payload?.button?.text ??
						data.waba_payload?.interactive?.button_reply?.title ? (
							<PrintMessage
								className="[word-break:break-word]"
								message={
									data.waba_payload?.text?.body ??
									getMessageCaption(data) ??
									data.waba_payload?.button?.text ??
									data.waba_payload?.interactive?.button_reply?.title ??
									''
								}
								linkify={true}
							/>
						) : (
							'\u00A0'
						)}

						{!hasAnyStatus(data) && (
							<ChatMessageErrors data={data} retryMessage={retryMessage} />
						)}

						<span
							// The time and status, floating at the bubble's bottom right
							className={cn('float-right', data.from_us && 'cursor-pointer')}
							onClick={() => {
								if (data.from_us && isInfoClickable) {
									const clonedMessage = clone(data) as Message;
									// Injecting reactions
									clonedMessage.reactions = reactions;
									setMessageWithStatuses?.(clonedMessage);
									dispatch(setState({ isMessageStatusesVisible: true }));
								}
							}}
						>
							<span className="ml-2.5 text-[length:x-small] text-ink/60">
								<Moment
									date={getMessageTimestamp(data)}
									format={dateFormat}
									unix
								/>
							</span>

							{(!data.is_failed || hasAnyStatus(data)) && data.from_us && (
								<>
									{isPending(data) && (
										<AccessTimeIcon
											className={statusIconClassName(false)}
											color="inherit"
											style={iconStyles}
										/>
									)}

									{isJustSent(data) && (
										<DoneIcon
											className={statusIconClassName()}
											color="inherit"
											style={iconStyles}
										/>
									)}

									{isDeliveredOrRead(data) && (
										<DoneAllIcon
											// Grey, light blue once read
											className={cn(
												statusIconClassName(),
												'fill-[#8990b4]! transition-[fill] duration-300 ease-[ease]',
												isRead(data) && 'fill-light-blue!'
											)}
											color="inherit"
											style={iconStyles}
										/>
									)}
								</>
							)}

							{data.is_failed && !hasAnyStatus(data) && (
								<ErrorIcon
									className={cn(statusIconClassName(), '[&_*]:fill-[red]')}
									color="inherit"
									style={iconStyles}
								/>
							)}
						</span>

						{reactionsWithCount && reactionsWithCount.length > 0 && (
							<div
								className="absolute left-1.25 flex h-[23px] cursor-pointer items-center gap-1.25 rounded-[12px] border border-chat-bg bg-white px-1.25 text-[15px] shadow-[0_3px_5px_-6px_rgba(0,0,45,0.4)]"
								onClick={(event) => onReactionDetailsClick?.(event, data)}
							>
								{reactionsWithCount.map((item) => (
									<div
										className={cn(
											reactionClassName,
											'[&_.emoji-mart-emoji]:size-[15px]! [&_.printMessage>span]:flex'
										)}
										key={item.emoji}
									>
										<PrintMessage message={item.emoji} />
									</div>
								))}
								{reactionsWithCount.length > 1 && (
									<span className={cn(reactionClassName, 'opacity-50')}>
										{reactionsWithCount.length}
									</span>
								)}
							</div>
						)}

						<div style={{ clear: 'both' }} />
					</div>
				</div>
			)}
		</div>
	);
};

export default ChatMessage;
