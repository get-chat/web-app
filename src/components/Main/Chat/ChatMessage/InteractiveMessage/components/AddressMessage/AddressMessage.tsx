import PrintMessage from '@src/components/PrintMessage';
import { Button } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import InteractiveMessageProps from '@src/components/Main/Chat/ChatMessage/InteractiveMessage/components/InteractiveMessageProps';
import * as Styled from './AddressMessage.styles';

const AddressMessage: React.FC<InteractiveMessageProps> = ({ interactive }) => {
	const { header, body, footer, action } = interactive ?? {};
	const { t } = useTranslation();

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
			{action?.name === 'address_message' && (
				<Button
					color="primary"
					fullWidth
					href={action?.parameters?.url}
					disabled
				>
					{t('Provide address')}
				</Button>
			)}
		</>
	);
};

export default AddressMessage;
