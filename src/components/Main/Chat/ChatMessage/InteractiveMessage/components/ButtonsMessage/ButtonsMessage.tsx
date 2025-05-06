import React from 'react';
import { Button } from '@mui/material';
import PrintMessage from '@src/components/PrintMessage';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
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
						<Button key={reply?.id ?? index} color="primary" fullWidth disabled>
							{reply?.title}
						</Button>
					))}
				</Styled.Actions>
			)}
		</>
	);
};

export default ButtonsMessage;
