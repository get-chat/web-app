import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogTitle,
} from '@src/components/ui/dialog';
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
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
			{/* overflow-visible: the avatar sticks out over the top edge */}
			<DialogContent aria-describedby={undefined} className="overflow-visible">
				<DialogTitle className="sr-only">{t('Open in WhatsApp')}</DialogTitle>
				<DialogBody>
					<Styled.ContentWrapper>
						<BusinessProfileAvatar profilePhoto={profilePhoto} />
						<Styled.ContentTitle>
							{t('Scan this code to start a WhatsApp chat with this number.')}
						</Styled.ContentTitle>
						<a href={`https://wa.me/${phoneNumber}`} target="_blank">
							<Styled.QRContainer>
								<QRCodeSVG
									value={`https://wa.me/${phoneNumber}`}
									size={200}
									bgColor={'var(--gray-lighter)'}
								/>
							</Styled.QRContainer>
						</a>
					</Styled.ContentWrapper>
				</DialogBody>
				<DialogFooter>
					<Button variant="ghost" color="secondary" onClick={close}>
						{t('Close')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default OpenInWhatsAppDialog;
