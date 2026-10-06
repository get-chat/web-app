import PrintMessage from '@src/components/PrintMessage';
import React from 'react';
import LaunchIcon from '@src/components/icons/OpenInNew';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import InteractiveMessageButton from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageButton';
import InteractiveMessageText from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageText';

const CtaUrlMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
	const { header, body, footer, action } = interactive ?? {};

	return (
		<>
			<InteractiveMessageText header={header} body={body} footer={footer} />
			{action?.name === 'cta_url' && (
				<InteractiveMessageButton href={action?.parameters?.url} disabled>
					<LaunchIcon />
					{action?.parameters?.display_text}
				</InteractiveMessageButton>
			)}
		</>
	);
};

export default CtaUrlMessage;
