import React from 'react';
import styles from './MessageStatuses.module.css';
import ChatMessageModel from '@src/api/models/ChatMessageModel';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setMessageStatusesVisible } from '@src/store/reducers/UIReducer';
import ChatMessage from '@src/components/Main/Chat/ChatMessage/ChatMessage';

interface Props {
	message?: ChatMessageModel;
}

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

				<h3>{t('Message Statuses')}</h3>
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
					</>
				)}
			</div>
		</div>
	);
};

export default MessageStatuses;
