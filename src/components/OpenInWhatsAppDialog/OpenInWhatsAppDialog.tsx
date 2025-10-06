import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DialogActions, DialogTitle } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import * as Styled from './OpenInWhatsAppDialog.styles';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
}

const OpenInWhatsAppDialog: React.FC<Props> = ({ open, setOpen }) => {
	const { t } = useTranslation();

	const close = () => {
		setOpen(false);
	};

	return (
		<Styled.StyledDialog open={open} onClose={close} fullWidth>
			<DialogTitle>{t('Open in WhatsApp')}</DialogTitle>
			<DialogContent>
				<Styled.ContentWrapper>
					<Styled.ContentTitle>
						{t('Scan this code to start a WhatsApp chat with this number.')}
					</Styled.ContentTitle>
					<QRCodeSVG value={'https://wa.me/0000'} size={200} />
				</Styled.ContentWrapper>
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
			</DialogActions>
		</Styled.StyledDialog>
	);
};

export default OpenInWhatsAppDialog;
