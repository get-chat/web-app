import React from 'react';
import DoneAll from '@mui/icons-material/DoneAll';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Moment from 'react-moment';
import '../../../../styles/InputRange.css';
import NoteIcon from '@mui/icons-material/Note';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MessageDateIndicator from '../MessageDateIndicator';
import ContextChatMessage from './ContextChatMessage';
import ReplyIcon from '@mui/icons-material/Reply';
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
import { InsertEmoticon } from '@mui/icons-material';
import useReactions from '@src/hooks/useReactions';
import { setState } from '@src/store/reducers/UIReducer';
import { Template } from '@src/types/templates';
import {
	generateImageLink,
	generateStickerLink,
	generateVideoLink,
	getMessageCaption,
	getMessageTimestamp,
	getSenderName,
	hasAnyStatus,
	hasMediaToPreview,
	isDeliveredOrRead,
	isJustSent,
	isPending,
	isRead,
} from '@src/helpers/MessageHelper';
import { Message, MessageType } from '@src/types/messages';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import * as Styled from './ChatMessage.styles';

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
		<Styled.ChatMessageOuter
			id={'message_' + data.id}
			$isOutgoing={data.from_us}
			$type={data.waba_payload?.type}
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
						<Styled.SenderName $isOutgoing={data.from_us}>
							{data.from_us
								? getSenderName(data)
								: contactProvidersData?.[data.waba_payload?.wa_id ?? '']?.[0]
										?.name ?? getSenderName(data)}
						</Styled.SenderName>
					)}

					{data.waba_payload?.type === MessageType.sticker && (
						<img
							className="chat__media chat__sticker"
							src={generateStickerLink(data)}
							alt={getMessageCaption(data) ?? ''}
						/>
					)}

					<Styled.ChatMessage
						$type={data.waba_payload?.type ?? MessageType.none}
						$isOutgoing={data.from_us}
						$isReceived={data.from_us && isRead(data)}
						$hasMedia={hasMediaToPreview(data)}
						$hasReaction={reactions.length > 0}
						$isSenderHidden={!displaySender && !displayDate}
						$isFailed={data.is_failed}
					>
						{isActionsEnabled && (
							<Styled.Actions
								$isRight={!data.from_us}
								$isNonText={data.waba_payload?.type !== MessageType.text}
								$isExpired={!!isExpired}
							>
								{!isExpired && (
									<Styled.Action
										onClick={(event) => onQuickReactionsClick?.(event, data)}
									>
										<InsertEmoticon />
									</Styled.Action>
								)}

								{((data.from_us &&
									data.waba_payload?.type === MessageType.text) ||
									data.waba_payload?.type === MessageType.audio) && (
									<Styled.Action
										onClick={(event) => onOptionsClick?.(event, data)}
									>
										<ExpandMoreIcon />
									</Styled.Action>
								)}
							</Styled.Actions>
						)}

						{data.context?.forwarded && (
							<Styled.Forwarded>
								<ReplyIcon />
								<span>{t('Forwarded')}</span>
							</Styled.Forwarded>
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

						{data.waba_payload?.text?.body ??
						getMessageCaption(data) ??
						data.waba_payload?.button?.text ??
						data.waba_payload?.interactive?.button_reply?.title ? (
							<PrintMessage
								className="wordBreakWord"
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
							className="chat__message__info"
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
							<span className="chat__timestamp">
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
											className="chat__iconPending"
											color="inherit"
											style={iconStyles}
										/>
									)}

									{isJustSent(data) && (
										<DoneIcon
											className="chat__iconDone"
											color="inherit"
											style={iconStyles}
										/>
									)}

									{isDeliveredOrRead(data) && (
										<DoneAll
											className="chat__iconDoneAll"
											color="inherit"
											style={iconStyles}
										/>
									)}
								</>
							)}

							{data.is_failed && !hasAnyStatus(data) && (
								<ErrorIcon
									className="chat__iconError"
									color="inherit"
									style={iconStyles}
								/>
							)}
						</span>

						{reactionsWithCount && reactionsWithCount.length > 0 && (
							<Styled.Reactions
								onClick={(event) => onReactionDetailsClick?.(event, data)}
							>
								{reactionsWithCount.map((item) => (
									<Styled.Reaction key={item.emoji}>
										<PrintMessage message={item.emoji} />
									</Styled.Reaction>
								))}
								{reactionsWithCount.length > 1 && (
									<Styled.ReactionCount>
										{reactionsWithCount.length}
									</Styled.ReactionCount>
								)}
							</Styled.Reactions>
						)}

						<div style={{ clear: 'both' }} />
					</Styled.ChatMessage>
				</div>
			)}
		</Styled.ChatMessageOuter>
	);
};

export default ChatMessage;
