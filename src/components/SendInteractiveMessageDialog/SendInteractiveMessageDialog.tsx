import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type Props = {
	isVisible: boolean;
	setVisible: (visible: boolean) => void;
	interactiveMessage?: any;
	onSend: (interactiveMessage: any) => void;
};

const SendInteractiveMessageDialog: React.FC<Props> = ({
	isVisible,
	setVisible,
	interactiveMessage,
	onSend,
}) => {
	const { t } = useTranslation();

	const close = () => {
		setVisible(false);
	};

	return (
		<Dialog open={isVisible} onClose={close}>
			<DialogTitle>{t('Send a interactive message')}</DialogTitle>
			<DialogContent>{JSON.stringify(interactiveMessage)}</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
				<Button
					onClick={() => onSend(interactiveMessage)}
					color="primary"
					autoFocus
				>
					{t('Send')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default SendInteractiveMessageDialog;
