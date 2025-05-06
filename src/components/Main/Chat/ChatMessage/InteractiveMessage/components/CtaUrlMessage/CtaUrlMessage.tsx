import PrintMessage from '@src/components/PrintMessage';
import { Button } from '@mui/material';
import React from 'react';
import LaunchIcon from '@mui/icons-material/Launch';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import * as Styled from './CtaUrlMessage.styles';

const CtaUrlMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
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
			{action?.name === 'cta_url' && (
				<Button
					color="primary"
					fullWidth
					startIcon={<LaunchIcon />}
					href={action?.parameters?.url}
					disabled
				>
					{action?.parameters?.display_text}
				</Button>
			)}
		</>
	);
};

export default CtaUrlMessage;
