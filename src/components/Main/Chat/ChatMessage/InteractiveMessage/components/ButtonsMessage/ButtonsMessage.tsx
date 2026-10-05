import React from 'react';
import ReplyIcon from '@mui/icons-material/Reply';
import PrintMessage from '@src/components/PrintMessage';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import InteractiveMessageButton from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageButton';
import * as Styled from './ButtonsMessage.styles';

const ButtonsMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
	const { header, body, footer, action } = interactive ?? {};

	return (
		<>
			{header && (
				<Styled.Header>
					<PrintMessage linkify message={header.text} />
				</Styled.Header>
			)}
			{body && (
				<Styled.Body>
					<PrintMessage linkify message={body.text} />
				</Styled.Body>
			)}
			{footer && (
				<Styled.Footer>
					<PrintMessage linkify message={footer.text} />
				</Styled.Footer>
			)}
			{action?.buttons && Array.isArray(action?.buttons) && (
				<Styled.Actions>
					{action?.buttons.map(({ reply }, index: number) => (
						<InteractiveMessageButton key={index} disabled>
							<ReplyIcon />
							{reply?.title}
						</InteractiveMessageButton>
					))}
				</Styled.Actions>
			)}
		</>
	);
};

export default ButtonsMessage;
