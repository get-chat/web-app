import React from 'react';
import styles from './MessageStatuses.module.css';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import ChatMessage from '@src/components/Main/Chat/ChatMessage/ChatMessage';
import Moment from 'react-moment';
import DoneIcon from '@mui/icons-material/Done';
import DoneAll from '@mui/icons-material/DoneAll';
import useMessageStatuses from '@src/components/MessageStatuses/useMessageStatuses';
import ChatMessageErrors from '@src/components/ChatMessageErrors';
import useReactions from '@src/hooks/useReactions';
import { CALENDAR_SHORT } from '@src/Constants';
import PrintMessage from '@src/components/PrintMessage';

interface Props {
	message?: ChatMessageModel;
}

const dateFormat = 'H:mm, DD.MM.YYYY';

const MessageStatuses: React.FC<Props> = ({ message: initialMessage }) => {
	const { t } = useTranslation();

	const { message, templates, close } = useMessageStatuses({ initialMessage });
	const { reactions } = useReactions({
		reactionsHistory: message?.reactions,
	});

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<IconButton onClick={close} size="large">
					<CloseIcon />
				</IconButton>

				<h3>{t('Message Information')}</h3>
			</div>
			<div className={styles.body}>
				{message && (
					<>
						<div className={styles.preview}>
							<ChatMessage
								data={message}
								templateData={
									message.templateName
										? templates[message.templateName]
										: undefined
								}
							/>
						</div>

						{reactions.length > 0 && (
							<div className={styles.section}>
								<h5>{t('Reactions')}</h5>
								{reactions
									.filter((item) => !!item.reaction?.emoji)
									.map((reaction) => (
										<div className={styles.reaction}>
											<div className={styles.sender}>{reaction.senderName}</div>
											<div className={styles.timestamp}>
												<Moment
													date={reaction.timestamp}
													calendar={CALENDAR_SHORT}
													unix
												/>
											</div>
											<PrintMessage
												message={reaction.reaction?.emoji ?? ''}
												smallEmoji
											/>
										</div>
									))}
							</div>
						)}

						<div className={styles.section}>
							{message.sentTimestamp && (
								<>
									<div className={styles.subSection}>
										<div className={styles.subSectionTitle}>
											<DoneIcon color="inherit" />
											<h5>{t('Sent at')}</h5>
										</div>
										<Moment
											date={message.sentTimestamp}
											format={dateFormat}
											unix
											className={styles.subSectionText}
										/>
									</div>
								</>
							)}
							{message.deliveredTimestamp && (
								<>
									<Divider />
									<div className={styles.subSection}>
										<div className={styles.subSectionTitle}>
											<DoneAll color="inherit" />
											<h5>{t('Delivered at')}</h5>
										</div>
										<Moment
											date={message.deliveredTimestamp}
											format={dateFormat}
											unix
											className={styles.subSectionText}
										/>
									</div>
								</>
							)}
							{message.readTimestamp && (
								<>
									<Divider />
									<div className={styles.subSection}>
										<div className={styles.subSectionTitle}>
											<DoneAll color="inherit" className={styles.blueIcon} />
											<h5>{t('Read at')}</h5>
										</div>
										<Moment
											date={message.readTimestamp}
											format={dateFormat}
											unix
											className={styles.subSectionText}
										/>
									</div>
								</>
							)}
						</div>

						{message.hasErrors() && (
							<div className={styles.section}>
								<h5>
									{t(
										message.hasAnyStatus()
											? 'There were some problems sending your message, but your message was sent successfully after problems have resolved.'
											: 'There are some problems sending your message:'
									)}
								</h5>
								<ChatMessageErrors data={message} />
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default MessageStatuses;
