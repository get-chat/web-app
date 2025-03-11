import styles from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/ButtonsMessage/ButtonsMessage.module.css';
import PrintMessage from '@src/components/PrintMessage';
import { Button } from '@mui/material';
import React from 'react';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';

const FlowMessage: React.FC<InteractiveMessageProps> = ({
	header,
	body,
	footer,
	action,
}) => {
	return (
		<>
			{header && (
				<div className={styles.header}>
					<PrintMessage linkify message={header.text} />
				</div>
			)}
			{body && (
				<div className={styles.body}>
					<PrintMessage linkify message={body.text} />
				</div>
			)}
			{footer && (
				<div className={styles.footer}>
					<PrintMessage linkify message={footer.text} />
				</div>
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
