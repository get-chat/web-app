import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import styles from './ChatMessageDocument.pcss';
import ChatMessageModel from '@src/api/models/ChatMessageModel';

interface ChatMessageDocumentProps {
	data: ChatMessageModel;
}

const ChatMessageDocument: FC<ChatMessageDocumentProps> = ({ data }) => {
	const { t } = useTranslation();

	return (
		<a
			className={styles.documentMessage}
			href={data.documentLink ?? data.getHeaderFileLink('document')}
			download={data.documentFileName}
			target="_blank"
		>
			<InsertDriveFileIcon fontSize="small" />
			<span className={styles.documentMessageFilename}>
				{data.documentCaption ?? data.documentFileName ?? t('Document')}
			</span>
		</a>
	);
};

export default ChatMessageDocument;
