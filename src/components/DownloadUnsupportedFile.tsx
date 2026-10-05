import React from 'react';
import { Button } from '@src/components/ui/button';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@src/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import UnsupportedFileClass from '@src/UnsupportedFileClass';

interface Props {
	data: UnsupportedFileClass | undefined | null;
	open: boolean;
	setOpen: (value: boolean) => void;
}

const DownloadUnsupportedFile: React.FC<Props> = ({ data, open, setOpen }) => {
	const { t } = useTranslation();

	const close = () => {
		setOpen(false);
	};

	const download = () => {
		window.open(data?.link, '_blank')?.focus();
		close();
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t('Unsupported file type')}</DialogTitle>
				</DialogHeader>

				<DialogBody>
					<DialogDescription>
						{t(
							'This file type is not supported, however you can still download it.'
						)}
					</DialogDescription>
				</DialogBody>

				<DialogFooter>
					<Button variant="ghost" color="secondary" onClick={close}>
						{t('Close')}
					</Button>
					<Button variant="ghost" color="primary" onClick={download}>
						{t('Download')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DownloadUnsupportedFile;
