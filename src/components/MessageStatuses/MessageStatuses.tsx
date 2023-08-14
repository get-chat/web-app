import React from 'react';
import styles from './MessageStatuses.module.css';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setMessageStatusesVisible } from '@src/store/reducers/UIReducer';
import ChatMessage from '@src/components/Main/Chat/ChatMessage/ChatMessage';
import Moment from 'react-moment';
import DoneIcon from '@mui/icons-material/Done';
import DoneAll from '@mui/icons-material/DoneAll';

interface Props {
	message?: ChatMessageModel;
}

const dateFormat = 'H:mm, DD.MM.YYYY';

const MessageStatuses: React.FC<Props> = ({ message }) => {
	const { t } = useTranslation();

	const dispatch = useAppDispatch();

	const templates = useAppSelector((state) => state.templates.value);

	const close = () => dispatch(setMessageStatusesVisible(false));

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
								displaySender={false}
								displayDate={false}
								contactProvidersData={{}}
								isTemplatesFailed={false}
								disableMediaPreview={false}
							/>
						</div>

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
									<Divider />
								</>
							)}
							{message.deliveredTimestamp && (
								<>
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
									<Divider />
								</>
							)}
							{message.readTimestamp && (
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
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default MessageStatuses;
