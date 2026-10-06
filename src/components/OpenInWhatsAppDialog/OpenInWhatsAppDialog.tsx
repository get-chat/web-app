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
					<div className="flex flex-col items-center">
						<BusinessProfileAvatar
							className="fixed -mt-2.5 size-25 outline-5 outline-white [&_img]:[-webkit-user-drag:none]"
							profilePhoto={profilePhoto}
						/>
						<div className="mt-15 mb-5 text-[16px]">
							{t('Scan this code to start a WhatsApp chat with this number.')}
						</div>
						<a href={`https://wa.me/${phoneNumber}`} target="_blank">
							<div className="rounded-[20px] bg-gray-lighter p-5">
								<QRCodeSVG
									value={`https://wa.me/${phoneNumber}`}
									size={200}
									bgColor={'var(--gray-lighter)'}
								/>
							</div>
						</a>
					</div>
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
