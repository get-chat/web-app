import React from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import { Button, Dialog } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import { useTranslation } from 'react-i18next';

const BulkSendTemplateViaCSV = ({ open, setOpen }) => {
	const { t } = useTranslation();

	const close = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onClose={close} className="changePasswordDialog">
			<DialogTitle>{t('Bulk send template via CSV')}</DialogTitle>
			<DialogContent className="sendBulkVoiceMessageDialogContent">
				<div>
					{t(
						'You can upload a CSV file that contains a phone number and template parameters in every row.'
					)}
				</div>
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default BulkSendTemplateViaCSV;
