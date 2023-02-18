// @ts-nocheck
import React from 'react';
import ChatMessageModel from '../../../../api/models/ChatMessageModel';
import { useTranslation } from 'react-i18next';

function ChatMessageTypeLabel({ type }) {
	const { t } = useTranslation();

	return (
		<span className="chatMessageTypeLabel">
			{type === ChatMessageModel.TYPE_IMAGE && <span>{t('Image')}</span>}

			{type === ChatMessageModel.TYPE_VIDEO && <span>{t('Video')}</span>}

			{type === ChatMessageModel.TYPE_VOICE && <span>{t('Voice')}</span>}

			{type === ChatMessageModel.TYPE_AUDIO && <span>{t('Audio')}</span>}

			{type === ChatMessageModel.TYPE_DOCUMENT && <span>{t('Document')}</span>}

			{type === ChatMessageModel.TYPE_STICKER && <span>{t('Sticker')}</span>}

			{type === ChatMessageModel.TYPE_LOCATION && <span>{t('Location')}</span>}

			{type === ChatMessageModel.TYPE_TEMPLATE && <span>{t('Template')}</span>}

			{type === ChatMessageModel.TYPE_INTERACTIVE && (
				<span>{t('Interactive')}</span>
			)}

			{type === ChatMessageModel.TYPE_CONTACTS && <span>{t('Contacts')}</span>}
		</span>
	);
}

export default ChatMessageTypeLabel;
