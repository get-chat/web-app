import PrintMessage from '@src/components/PrintMessage';
import React from 'react';
import LaunchIcon from '@mui/icons-material/Launch';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import InteractiveMessageButton from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageButton';
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
				<InteractiveMessageButton href={action?.parameters?.url} disabled>
					<LaunchIcon />
					{action?.parameters?.display_text}
				</InteractiveMessageButton>
			)}
		</>
	);
};

export default CtaUrlMessage;
