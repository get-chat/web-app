import PrintMessage from '@src/components/PrintMessage';
import React from 'react';
import { useTranslation } from 'react-i18next';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import InteractiveMessageButton from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageButton';
import InteractiveMessageText from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageText';

const CatalogMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
	const { header, body, footer, action } = interactive ?? {};
	const { t } = useTranslation();

	return (
		<>
			<InteractiveMessageText header={header} body={body} footer={footer} />
			{action?.name === 'catalog_message' && (
				<InteractiveMessageButton href={action?.parameters?.url} disabled>
					{t('View catalog')}
				</InteractiveMessageButton>
			)}
		</>
	);
};

export default CatalogMessage;
