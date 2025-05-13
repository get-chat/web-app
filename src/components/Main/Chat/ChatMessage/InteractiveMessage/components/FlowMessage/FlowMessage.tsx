import PrintMessage from '@src/components/PrintMessage';
import { Button } from '@mui/material';
import React from 'react';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import * as Styled from './FlowMessage.styles';

const FlowMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
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
			{action?.name === 'flow' && (
				<Button
					color="primary"
					fullWidth
					href={action?.parameters?.url}
					disabled
				>
					{action?.parameters?.flow_cta}
				</Button>
			)}
		</>
	);
};

export default FlowMessage;
