import React, { Fragment, useEffect, useMemo } from 'react';
import DoneAll from '@mui/icons-material/DoneAll';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Moment from 'react-moment';
import '../../../../styles/InputRange.css';
import NoteIcon from '@mui/icons-material/Note';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChatMessageModel from '../../../../api/models/ChatMessageModel';
import MessageDateIndicator from '../MessageDateIndicator';
import ContextChatMessage from './ContextChatMessage';
import ReplyIcon from '@mui/icons-material/Reply';
import ChatMessageVideo from './ChatMessageVideo';
import ChatMessageImage from './ChatMessageImage';
import ChatMessageDocument from './ChatMessageDocument';
import ChatMessageVoice from './ChatMessageVoice';
import ChatMessageTemplate from './ChatMessageTemplate';
import ChatAssignmentEvent from '../../../ChatAssignmentEvent';
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
import TemplateModel from '@src/api/models/TemplateModel';
import { setMessageStatusesVisible } from '@src/store/reducers/UIReducer';
import { clone } from '@src/helpers/ObjectHelper';
import classNames from 'classnames/bind';
import styles from './ChatMessage.module.css';
import { InsertEmoticon } from '@mui/icons-material';
import useChatMessage from '@src/components/Main/Chat/ChatMessage/useChatMessage';

interface Props {
	data: ChatMessageModel;
	reactionsHistory: ChatMessageModel[];
	templateData?: TemplateModel;
	displaySender?: boolean;
	displayDate?: boolean;
	isExpired?: boolean;
	contactProvidersData?: { [key: string]: any };
	onOptionsClick?: (e: React.MouseEvent, data: ChatMessageModel) => void;
	onQuickReactionsClick?: (e: React.MouseEvent, data: ChatMessageModel) => void;
	goToMessageId?: (msgId: string, timestamp: number) => void;
	isTemplatesFailed?: boolean;
	retryMessage?: (message: ChatMessageModel) => void;
	disableMediaPreview?: boolean;
	setMessageWithStatuses?: (message?: ChatMessageModel) => void;
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
	goToMessageId,
	isTemplatesFailed,
	retryMessage,
	disableMediaPreview,
	setMessageWithStatuses,
}) => {
	const { t } = useTranslation();

	const dispatch = useAppDispatch();

	const { reactions, reactionsWithCount } = useChatMessage({
		reactionsHistory,
	});

	const onPreview = (type: string, source: string) => {
		if (!disableMediaPreview) {
			const previewData = new PreviewMediaModel(
				data.senderName,
				data.initials,
				type,
				source,
				data.timestamp
			);

			dispatch(setPreviewMediaObject(previewData));
		}
	};

	const dateFormat = 'H:mm';

	const cx = classNames.bind(styles);

	return (
		<div
			id={'message_' + data.id}
			className={cx({
				chat__message__outer: true,
				outgoing: data.isFromUs,
				['messageType__' + data.type]: true,
			})}
		>
			{displayDate && <MessageDateIndicator timestamp={data.timestamp} />}

			{data.assignmentEvent && (
				<ChatAssignmentEvent data={data.assignmentEvent} />
			)}

			{data.taggingEvent && <ChatTaggingEvent data={data.taggingEvent} />}

			{!data.assignmentEvent && !data.taggingEvent && (
				<div>
					{(displaySender || displayDate) && (
						<div className="chat__name">
							{data.isFromUs
								? data.senderName
								: contactProvidersData?.[data.waId]?.[0]?.name ??
								  data.senderName}
						</div>
					)}

					{data.type === ChatMessageModel.TYPE_STICKER && (
						<img
							className="chat__media chat__sticker"
							src={data.generateStickerLink()}
							alt={data.caption ?? ''}
						/>
					)}

					<div
						className={cx({
							chat__message: true,
							[styles.messageWithReaction]: reactions.length > 0,
							['messageType__' + data.type]: true,
							hasMedia: data.hasMediaToPreview(),
							chat__outgoing: data.isFromUs,
							chat__received: data.isFromUs && data.isRead(),
							hiddenSender: !displaySender && !displayDate,
							chat__failed: data.isFailed,
						})}
					>
						<div
							className={cx({
								[styles.actions]: true,
								[styles.right]: !data.isFromUs,
								[styles.nonText]: data.type !== ChatMessageModel.TYPE_TEXT,
								[styles.isExpired]: !!isExpired,
							})}
						>
							{!isExpired && (
								<div
									className={styles.action}
									onClick={(event) => onQuickReactionsClick?.(event, data)}
								>
									<InsertEmoticon />
								</div>
							)}

							{data.isFromUs && data.type === ChatMessageModel.TYPE_TEXT && (
								<div
									className={styles.action}
									onClick={(event) => onOptionsClick?.(event, data)}
								>
									<ExpandMoreIcon />
								</div>
							)}
						</div>

						{data.isForwarded && (
							<div className={styles.forwarded}>
								<ReplyIcon />
								<span>{t('Forwarded')}</span>
							</div>
						)}

						{data.contextMessage !== undefined && (
							<ContextChatMessage
								contextMessage={data.contextMessage}
								goToMessageId={goToMessageId}
							/>
						)}

						{data.referral && (
							<ChatMessageReferral
								data={data}
								onPreview={onPreview}
								onOptionsClick={(e: React.MouseEvent) =>
									onOptionsClick?.(e, data)
								}
							/>
						)}

						{data.type === ChatMessageModel.TYPE_IMAGE && (
							<ChatMessageImage
								data={data}
								source={data.generateImageLink()}
								onPreview={() =>
									onPreview(ATTACHMENT_TYPE_IMAGE, data.generateImageLink())
								}
							/>
						)}

						{data.type === ChatMessageModel.TYPE_VIDEO && (
							<ChatMessageVideo
								source={data.generateVideoLink()}
								onPreview={() =>
									onPreview(ATTACHMENT_TYPE_VIDEO, data.generateVideoLink())
								}
								onOptionsClick={(e) => onOptionsClick?.(e, data)}
							/>
						)}

						{(data.type === ChatMessageModel.TYPE_VOICE ||
							data.type === ChatMessageModel.TYPE_AUDIO) && (
							<ChatMessageVoice data={data} />
						)}

						{data.type === ChatMessageModel.TYPE_DOCUMENT && (
							<ChatMessageDocument data={data} />
						)}

						{data.type === ChatMessageModel.TYPE_STICKER && (
							<span>
								<NoteIcon fontSize="small" />
							</span>
						)}

						{data.type === ChatMessageModel.TYPE_LOCATION && (
							<ChatMessageLocation data={data} />
						)}

						{data.type === ChatMessageModel.TYPE_TEMPLATE && (
							<ChatMessageTemplate
								data={data}
								templateData={templateData}
								isTemplatesFailed={isTemplatesFailed}
								onPreview={onPreview}
								onOptionsClick={(e: React.MouseEvent) =>
									onOptionsClick?.(e, data)
								}
							/>
						)}

						{data.type === ChatMessageModel.TYPE_INTERACTIVE && (
							<InteractiveMessage data={data} />
						)}

						{data.type === ChatMessageModel.TYPE_ORDER && (
							<OrderMessage data={data} />
						)}

						{data.type === ChatMessageModel.TYPE_CONTACTS && (
							<ContactsMessage data={data} />
						)}

						{data.text ??
						data.caption ??
						data.buttonText ??
						data.interactiveButtonText ? (
							<PrintMessage
								className="wordBreakWord"
								message={
									data.text ??
									data.caption ??
									data.buttonText ??
									data.interactiveButtonText ??
									''
								}
								linkify={true}
							/>
						) : (
							'\u00A0'
						)}

						{!data.hasAnyStatus() && (
							<ChatMessageErrors data={data} retryMessage={retryMessage} />
						)}

						<span
							className="chat__message__info"
							onClick={() => {
								if (data.isFromUs) {
									setMessageWithStatuses?.(clone(data));
									dispatch(setMessageStatusesVisible(true));
								}
							}}
						>
							<span className="chat__timestamp">
								<Moment date={data.timestamp} format={dateFormat} unix />
							</span>

							{(!data.isFailed || data.hasAnyStatus()) && data.isFromUs && (
								<>
									{data.isPending() && (
										<AccessTimeIcon
											className="chat__iconPending"
											color="inherit"
											style={iconStyles}
										/>
									)}

									{data.isJustSent() && (
										<DoneIcon
											className="chat__iconDone"
											color="inherit"
											style={iconStyles}
										/>
									)}

									{data.isDeliveredOrRead() && (
										<DoneAll
											className="chat__iconDoneAll"
											color="inherit"
											style={iconStyles}
										/>
									)}
								</>
							)}

							{data.isFailed && !data.hasAnyStatus() && (
								<ErrorIcon
									className="chat__iconError"
									color="inherit"
									style={iconStyles}
								/>
							)}
						</span>

						{reactionsWithCount && reactionsWithCount.length > 0 && (
							<div className={styles.reactions}>
								{reactionsWithCount.map((item) => (
									<div key={item.emoji} className={styles.reaction}>
										<PrintMessage message={item.emoji} />
									</div>
								))}
								{reactionsWithCount.length > 1 && (
									<div className={styles.reactionCount}>
										{reactionsWithCount.length}
									</div>
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
