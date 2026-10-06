import React from 'react';
import ReplyIcon from '@src/components/icons/Reply';
import PrintMessage from '@src/components/PrintMessage';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import InteractiveMessageButton from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageButton';
import InteractiveMessageText from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageText';

const ButtonsMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
	const { header, body, footer, action } = interactive ?? {};

	return (
		<>
			<InteractiveMessageText header={header} body={body} footer={footer} />
			{action?.buttons && Array.isArray(action?.buttons) && (
				<div className="flex flex-col items-center justify-center gap-1.25">
					{action?.buttons.map(({ reply }, index: number) => (
						<InteractiveMessageButton key={index} disabled>
							<ReplyIcon />
							{reply?.title}
						</InteractiveMessageButton>
					))}
				</div>
			)}
		</>
	);
};

export default ButtonsMessage;
