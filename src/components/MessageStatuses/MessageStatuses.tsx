import React from 'react';
import styles from './MessageStatuses.module.css';
import ChatMessageModel from '@src/api/models/ChatMessageModel';

interface Props {
	message?: ChatMessageModel;
}

const MessageStatuses: React.FC<Props> = ({ message }) => {
	return (
		<div className={styles.container}>
			{message && <>{JSON.stringify(message)}</>}
		</div>
	);
};

export default MessageStatuses;
