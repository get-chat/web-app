import React from 'react';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';
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
		<Dialog open={open} onClose={close}>
			<DialogTitle>{t('Unsupported file type')}</DialogTitle>

			<DialogContent>
				<DialogContentText>
					{t(
						'This file type is not supported, however you can still download it.'
					)}
				</DialogContentText>
			</DialogContent>

			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
				<Button onClick={download} color="primary">
					{t('Download')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DownloadUnsupportedFile;
