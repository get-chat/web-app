import React from 'react';
import { useTranslation } from 'react-i18next';
import { DialogTitle } from '@mui/material';
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
				<div>
					{t('Scan this code to start a WhatsApp chat with this number.')}
				</div>
				<QRCodeSVG value={'https://wa.me/0000'} />
			</DialogContent>
		</Styled.StyledDialog>
	);
};

export default OpenInWhatsAppDialog;
