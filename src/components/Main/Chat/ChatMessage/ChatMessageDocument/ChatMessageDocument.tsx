import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import styles from './ChatMessageDocument.pcss';
import { Message } from '@src/types/messages';
import { getHeaderFileLink } from '@src/helpers/MessageHelper';

interface ChatMessageDocumentProps {
	data: Message;
}

const ChatMessageDocument: FC<ChatMessageDocumentProps> = ({ data }) => {
	const { t } = useTranslation();

	return (
		<a
			className={styles.documentMessage}
			href={
				data.waba_payload?.document?.link ?? getHeaderFileLink(data, 'document')
			}
			download={data.waba_payload?.document?.filename}
			target="_blank"
		>
			<InsertDriveFileIcon fontSize="small" />
			<span className={styles.documentMessageFilename}>
				{data.waba_payload?.document?.caption ??
					data.waba_payload?.document?.filename ??
					t('Document')}
			</span>
		</a>
	);
};

export default ChatMessageDocument;
