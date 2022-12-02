import React from 'react';
import ReviewsIcon from '@mui/icons-material/Reviews';
import { useTranslation } from 'react-i18next';
import styles from './ChatMessageReferral.module.css';

const ChatMessageReferral = ({ data }) => {
	const { t } = useTranslation();

	return (
		<div className={styles.container}>
			<span className={styles.header}>
				<ReviewsIcon className={styles.headerIcon} />
				{t('Message via ad')}
				<br />
			</span>
		</div>
	);
};

export default ChatMessageReferral;
