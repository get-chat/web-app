import React from 'react';
import { useTranslation } from 'react-i18next';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Dialog } from '@material-ui/core';
import DialogContent from '@material-ui/core/DialogContent';

const UploadRecipientsCSV = ({ open, setOpen, tags }) => {
	const { t } = useTranslation();

	const close = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onClose={close} className="uploadRecipientsCSV">
			<DialogTitle>{t('Upload CSV')}</DialogTitle>
			<DialogContent>Content</DialogContent>
		</Dialog>
	);
};

export default UploadRecipientsCSV;
