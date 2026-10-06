import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import InsertDriveFileIcon from '@src/components/icons/Draft';

import { Message } from '@src/types/messages';
import { getHeaderFileLink } from '@src/helpers/MessageHelper';

interface ChatMessageDocumentProps {
	data: Message;
}

const ChatMessageDocument: FC<ChatMessageDocumentProps> = ({ data }) => {
	const { t } = useTranslation();

	return (
		<a
			// A grey card reaching to the bubble's edges, like the other media.
			// `!` on the text colour: the bubble colours every link light blue.
			className="-mx-1.5 -mt-px mb-1 flex rounded-[6px] bg-[rgba(0,0,45,0.05)] px-1.5 py-2.5 text-[#4a4a4a]! hover:bg-[rgba(0,0,45,0.08)]"
			href={
				data.waba_payload?.document?.link ?? getHeaderFileLink(data, 'document')
			}
			download={data.waba_payload?.document?.filename}
			target="_blank"
		>
			<InsertDriveFileIcon fontSize="small" />
			<span className="ml-1.25">
				{data.waba_payload?.document?.caption ??
					data.waba_payload?.document?.filename ??
					t('Document')}
			</span>
		</a>
	);
};

export default ChatMessageDocument;
