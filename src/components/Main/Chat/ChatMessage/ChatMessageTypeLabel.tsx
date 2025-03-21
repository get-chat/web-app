import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageType } from '@src/types/messages';

interface Props {
	type: string;
}

const ChatMessageTypeLabel: React.FC<Props> = ({ type }) => {
	const { t } = useTranslation();

	return (
		<span className="chatMessageTypeLabel">
			{type === MessageType.image && <span>{t('Image')}</span>}
			{type === MessageType.video && <span>{t('Video')}</span>}
			{type === MessageType.voice && <span>{t('Voice')}</span>}
			{type === MessageType.audio && <span>{t('Audio')}</span>}
			{type === MessageType.document && <span>{t('Document')}</span>}
			{type === MessageType.sticker && <span>{t('Sticker')}</span>}
			{type === MessageType.location && <span>{t('Location')}</span>}
			{type === MessageType.template && <span>{t('Template')}</span>}
			{type === MessageType.interactive && <span>{t('Interactive')}</span>}

			{type === MessageType.contacts && <span>{t('Contacts')}</span>}
		</span>
	);
};

export default ChatMessageTypeLabel;
