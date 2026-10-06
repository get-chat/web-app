import PrintMessage from '@src/components/PrintMessage';
import React from 'react';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import InteractiveMessageButton from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageButton';
import InteractiveMessageText from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageText';

const FlowMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
	const { header, body, footer, action } = interactive ?? {};

	return (
		<>
			<InteractiveMessageText header={header} body={body} footer={footer} />
			{action?.name === 'flow' && (
				<InteractiveMessageButton href={action?.parameters?.url} disabled>
					{action?.parameters?.flow_cta}
				</InteractiveMessageButton>
			)}
		</>
	);
};

export default FlowMessage;
