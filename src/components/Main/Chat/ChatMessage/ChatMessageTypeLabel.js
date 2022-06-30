import React from 'react';
import ChatMessageClass from '../../../../ChatMessageClass';
import { useTranslation } from 'react-i18next';

function ChatMessageTypeLabel({ type }) {
	const { t } = useTranslation();

	return (
		<span className="chatMessageTypeLabel">
			{type === ChatMessageClass.TYPE_IMAGE && <span>{t('Image')}</span>}

			{type === ChatMessageClass.TYPE_VIDEO && <span>{t('Video')}</span>}

			{type === ChatMessageClass.TYPE_VOICE && <span>{t('Voice')}</span>}

			{type === ChatMessageClass.TYPE_AUDIO && <span>{t('Audio')}</span>}

			{type === ChatMessageClass.TYPE_DOCUMENT && <span>{t('Document')}</span>}

			{type === ChatMessageClass.TYPE_STICKER && <span>{t('Sticker')}</span>}

			{type === ChatMessageClass.TYPE_LOCATION && <span>{t('Location')}</span>}

			{type === ChatMessageClass.TYPE_TEMPLATE && <span>{t('Template')}</span>}

			{type === ChatMessageClass.TYPE_INTERACTIVE && (
				<span>{t('Interactive')}</span>
			)}
		</span>
	);
}

export default ChatMessageTypeLabel;
