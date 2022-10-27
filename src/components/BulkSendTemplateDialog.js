import React from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import { Button, Dialog } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import { useTranslation } from 'react-i18next';
import '../styles/SendBulkVoiceMessageDialog.css';
import TemplateMessages from './Main/Chat/TemplateMessages/TemplateMessages';

const BulkSendTemplateDialog = ({
	apiService,
	open,
	setOpen,
	setUploadingMedia,
	setBulkSendPayload,
	setSelectionModeEnabled,
	bulkSendMessage,
	isTemplatesFailed,
	isLoadingTemplates,
}) => {
	const { t } = useTranslation();

	const close = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onClose={close} className="sendBulkTemplateDialog">
			<DialogTitle>{t('Bulk send a template')}</DialogTitle>
			<DialogContent className="sendBulkTemplateDialogContent">
				<TemplateMessages
					onBulkSend={bulkSendMessage}
					isTemplatesFailed={isTemplatesFailed}
					isLoadingTemplates={isLoadingTemplates}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default BulkSendTemplateDialog;
