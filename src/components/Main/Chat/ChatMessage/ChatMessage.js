import React from 'react';
import DoneAll from '@material-ui/icons/DoneAll';
import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import Moment from 'react-moment';
import '../../../../styles/InputRange.css';
import '../../../../AvatarStyles';
import NoteIcon from '@material-ui/icons/Note';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChatMessageClass from '../../../../ChatMessageClass';
import MessageDateIndicator from '../MessageDateIndicator';
import ContextChatMessage from './ContextChatMessage';
import ReplyIcon from '@material-ui/icons/Reply';
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
import PrintMessage from '../../../PrintMessage';
import { Alert } from '@material-ui/lab';

const iconStyles = {
	fontSize: '15px',
};

function ChatMessage(props) {
	const { t } = useTranslation();

	const data = props.messageData;
	const templateData =
		data.type === ChatMessageClass.TYPE_TEMPLATE
			? props.templates[data.templateName]
			: undefined;

	const dateFormat = 'H:mm';

	const resend = () => {
		// TODO: Implement
	};

	return (
		<div
			id={'message_' + data.id}
			className={
				'chat__message__outer' + (data.isFromUs === true ? ' outgoing' : '')
			}
		>
			{props.displayDate && <MessageDateIndicator timestamp={data.timestamp} />}

			{data.assignmentEvent && (
				<ChatAssignmentEvent data={data.assignmentEvent} />
			)}

			{data.taggingEvent && <ChatTaggingEvent data={data.taggingEvent} />}

			{!data.assignmentEvent && !data.taggingEvent && (
				<div>
					{(props.displaySender || props.displayDate) && (
						<PrintMessage
							className="chat__name"
							message={
								data.isFromUs === true
									? data.senderName
									: props.contactProvidersData[data.waId]?.[0]?.name ??
									  data.senderName
							}
						/>
					)}

					{data.type === ChatMessageClass.TYPE_STICKER && (
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
							(!props.displaySender && !props.displayDate
								? ' hiddenSender'
								: '') +
							(' messageType__' + data.type) +
							(data.isFailed ? ' chat__failed' : '')
						}
					>
						<div
							className="chat__message__more"
							onClick={(event) => props.onOptionsClick(event, data)}
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
								goToMessageId={props.goToMessageId}
							/>
						)}

						{data.type === ChatMessageClass.TYPE_IMAGE && (
							<ChatMessageImage
								data={data}
								source={data.generateImageLink()}
								onPreview={() => props.onPreview(data)}
							/>
						)}

						{data.type === ChatMessageClass.TYPE_VIDEO && (
							<ChatMessageVideo
								data={data}
								source={data.generateVideoLink()}
								onPreview={() => props.onPreview(data)}
							/>
						)}

						{(data.type === ChatMessageClass.TYPE_VOICE ||
							data.type === ChatMessageClass.TYPE_AUDIO) && (
							<ChatMessageVoice data={data} />
						)}

						{data.type === ChatMessageClass.TYPE_DOCUMENT && (
							<ChatMessageDocument data={data} />
						)}

						{data.type === ChatMessageClass.TYPE_STICKER && (
							<span>
								<NoteIcon fontSize="small" />
							</span>
						)}

						{data.type === ChatMessageClass.TYPE_LOCATION && (
							<ChatMessageLocation data={data} />
						)}

						{data.type === ChatMessageClass.TYPE_TEMPLATE && (
							<ChatMessageTemplate
								data={data}
								templateData={templateData}
								isTemplatesFailed={props.isTemplatesFailed}
								onPreview={() => props.onPreview(data)}
							/>
						)}

						{data.type === ChatMessageClass.TYPE_INTERACTIVE && (
							<InteractiveMessage data={data} />
						)}

						{data.type === ChatMessageClass.TYPE_ORDER && (
							<OrderMessage data={data} />
						)}

						{data.errors && (
							<Alert variant="filled" severity="error" className="chat__errors">
								{data.errors.map((error, index) => (
									<div key={index}>{t(error.details ?? error.title)}</div>
								))}
							</Alert>
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

						{data.isFailed && data.canRetry() && (
							<div>
								<span onClick={resend}>{t('Retry')}</span>
							</div>
						)}

						<div style={{ clear: 'both' }} />
					</div>
				</div>
			)}
		</div>
	);
}

export default ChatMessage;
