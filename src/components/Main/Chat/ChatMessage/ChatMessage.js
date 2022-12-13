import React from 'react';
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
import ChatTaggingEvent from './ChatTaggingEvent';
import ChatMessageLocation from './ChatMessageLocation';
import { useTranslation } from 'react-i18next';
import InteractiveMessage from './InteractiveMessage';
import OrderMessage from './OrderMessage';
import ContactsMessage from './ContactsMessage';
import PrintMessage from '../../../PrintMessage';
import Alert from '@mui/material/Alert';
import { Button } from '@mui/material';
import ChatMessageReferral from './ChatMessageReferral';
import { useDispatch } from 'react-redux';
import { setPreviewMediaObject } from '@src/store/reducers/previewMediaObjectReducer';
import PreviewMediaModel from '../../../../api/models/PreviewMediaModel';
import { ATTACHMENT_TYPE_IMAGE, ATTACHMENT_TYPE_VIDEO } from '@src/Constants';

const iconStyles = {
	fontSize: '15px',
};

function ChatMessage({
	data,
	templateData,
	displaySender,
	displayDate,
	contactProvidersData,
	onOptionsClick,
	goToMessageId,
	isTemplatesFailed,
	retryMessage,
	disableMediaPreview,
}) {
	const { t } = useTranslation();

	const dispatch = useDispatch();

	const onPreview = (type, source) => {
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

	return (
		<div
			id={'message_' + data.id}
			className={
				'chat__message__outer' + (data.isFromUs === true ? ' outgoing' : '')
			}
		>
			{displayDate && <MessageDateIndicator timestamp={data.timestamp} />}

			{data.assignmentEvent && (
				<ChatAssignmentEvent data={data.assignmentEvent} />
			)}

			{data.taggingEvent && <ChatTaggingEvent data={data.taggingEvent} />}

			{!data.assignmentEvent && !data.taggingEvent && (
				<div>
					{(displaySender || displayDate) && (
						<PrintMessage
							className="chat__name"
							message={
								data.isFromUs === true
									? data.senderName
									: contactProvidersData[data.waId]?.[0]?.name ??
									  data.senderName
							}
						/>
					)}

					{data.type === ChatMessageModel.TYPE_STICKER && (
						<img
							className="chat__media chat__sticker"
							src={data.generateStickerLink()}
							alt={data.caption}
						/>
					)}

					<div
						className={
							'chat__message' +
							(data.hasMediaToPreview() ? ' hasMedia' : '') +
							(data.isFromUs === true
								? (data.isRead() ? ' chat__received' : '') + ' chat__outgoing'
								: '') +
							(!displaySender && !displayDate ? ' hiddenSender' : '') +
							(' messageType__' + data.type) +
							(data.isFailed ? ' chat__failed' : '')
						}
					>
						<div
							className="chat__message__more"
							onClick={(event) => onOptionsClick(event, data)}
						>
							<ExpandMoreIcon />
						</div>

						{data.isForwarded && (
							<div className="chat__forwarded">
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
							<ChatMessageReferral data={data} onPreview={onPreview} />
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
								data={data}
								source={data.generateVideoLink()}
								onPreview={() =>
									onPreview(ATTACHMENT_TYPE_VIDEO, data.generateVideoLink())
								}
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
									data.interactiveButtonText
								}
							/>
						) : (
							'\u00A0'
						)}

						{data.errors &&
							data.errors.map((error, index) => {
								// Could not find translation for the requested language and locale
								if (error.code === 2003) {
									return (
										<Alert
											key={index}
											variant="filled"
											severity="warning"
											className="chat__errors"
											action={
												data.isFailed &&
												data.canRetry() && (
													<Button
														color="inherit"
														size="small"
														onClick={() => retryMessage(data)}
													>
														{t('Retry')}
													</Button>
												)
											}
										>
											<div>
												{t(
													'The language pack for this template is not installed on the server yet, try sending this message later'
												)}
											</div>
										</Alert>
									);
								}

								return (
									<Alert
										key={index}
										variant="filled"
										severity="error"
										className="chat__errors"
										action={
											data.isFailed &&
											data.canRetry() && (
												<Button
													color="inherit"
													size="small"
													onClick={() => retryMessage(data)}
												>
													{t('Retry')}
												</Button>
											)
										}
									>
										<div>{t(error.details ?? error.title)}</div>
									</Alert>
								);
							})}

						<span className="chat__message__info">
							<span className="chat__timestamp">
								<Moment date={data.timestamp} format={dateFormat} unix />
							</span>

							{!data.isFailed && data.isFromUs === true && (
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

							{data.isFailed && (
								<ErrorIcon
									className="chat__iconError"
									color="inherit"
									style={iconStyles}
								/>
							)}
						</span>

						<div style={{ clear: 'both' }} />
					</div>
				</div>
			)}
		</div>
	);
}

export default ChatMessage;
