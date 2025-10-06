import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DialogActions } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import * as Styled from './OpenInWhatsAppDialog.styles';
import { QRCodeSVG } from 'qrcode.react';
import BusinessProfileAvatar from '@src/components/BusinessProfileAvatar';
import { useAppSelector } from '@src/store/hooks';

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	profilePhoto: string | undefined;
}

const OpenInWhatsAppDialog: React.FC<Props> = ({
	open,
	setOpen,
	profilePhoto,
}) => {
	const { t } = useTranslation();

	const phoneNumber = useAppSelector((state) => state.phoneNumber.value);

	const close = () => {
		setOpen(false);
	};

	return (
		<Styled.StyledDialog open={open} onClose={close} fullWidth>
			<DialogContent>
				<Styled.ContentWrapper>
					<BusinessProfileAvatar profilePhoto={profilePhoto} />
					<Styled.ContentTitle>
						{t('Scan this code to start a WhatsApp chat with this number.')}
					</Styled.ContentTitle>
					<a href={`https://wa.me/${phoneNumber}`} target="_blank">
						<Styled.QRContainer>
							<QRCodeSVG value={`https://wa.me/${phoneNumber}`} size={200} />
						</Styled.QRContainer>
					</a>
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
