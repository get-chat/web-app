import React from 'react';
import styles from './MessageStatuses.module.css';
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
import { Message } from '@src/types/messages';
import {
	getMessageTimestamp,
	getSenderName,
	hasAnyStatus,
} from '@src/helpers/MessageHelper';

interface Props {
	message?: Message;
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
									message.waba_payload?.template?.name
										? templates[message.waba_payload.template.name]
										: undefined
								}
							/>
						</div>

						{reactions.length > 0 && (
							<div className={styles.section}>
								<h5>{t('Reactions')}</h5>
								{reactions
									.filter((item) => !!item.waba_payload?.reaction?.emoji)
									.map((reaction) => (
										<div className={styles.reaction}>
											<div className={styles.sender}>
												{getSenderName(reaction)}
											</div>
											<div className={styles.timestamp}>
												<Moment
													date={getMessageTimestamp(reaction)}
													calendar={CALENDAR_SHORT}
													unix
												/>
											</div>
											<PrintMessage
												message={reaction.waba_payload?.reaction?.emoji ?? ''}
												smallEmoji
											/>
										</div>
									))}
							</div>
						)}

						<div className={styles.section}>
							{message.waba_statuses?.sent && (
								<>
									<div className={styles.subSection}>
										<div className={styles.subSectionTitle}>
											<DoneIcon color="inherit" />
											<h5>{t('Sent at')}</h5>
										</div>
										<Moment
											date={message.waba_statuses.sent}
											format={dateFormat}
											unix
											className={styles.subSectionText}
										/>
									</div>
								</>
							)}
							{message.waba_statuses?.delivered && (
								<>
									<Divider />
									<div className={styles.subSection}>
										<div className={styles.subSectionTitle}>
											<DoneAll color="inherit" />
											<h5>{t('Delivered at')}</h5>
										</div>
										<Moment
											date={message.waba_statuses.delivered}
											format={dateFormat}
											unix
											className={styles.subSectionText}
										/>
									</div>
								</>
							)}
							{message.waba_statuses?.read && (
								<>
									<Divider />
									<div className={styles.subSection}>
										<div className={styles.subSectionTitle}>
											<DoneAll color="inherit" className={styles.blueIcon} />
											<h5>{t('Read at')}</h5>
										</div>
										<Moment
											date={message.waba_statuses.read}
											format={dateFormat}
											unix
											className={styles.subSectionText}
										/>
									</div>
								</>
							)}
						</div>

						{(message.waba_payload?.errors?.length ?? 0) > 0 && (
							<div className={styles.section}>
								<h5>
									{t(
										hasAnyStatus(message)
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
