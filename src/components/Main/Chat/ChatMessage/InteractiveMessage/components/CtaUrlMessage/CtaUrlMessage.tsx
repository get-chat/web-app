import styles from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/ButtonsMessage/ButtonsMessage.module.css';
import PrintMessage from '@src/components/PrintMessage';
import { Button } from '@mui/material';
import React from 'react';
import LaunchIcon from '@mui/icons-material/Launch';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';

const CtaUrlMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
	const { header, body, footer, action } = interactive ?? {};

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
