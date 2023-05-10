// @ts-nocheck
import React, { useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Button, Dialog } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import { useTranslation } from 'react-i18next';
import '../styles/SendBulkVoiceMessageDialog.css';
import TemplateListWithControls from '@src/components/TemplateListWithControls';
import SendTemplateDialog from '@src/components/SendTemplateDialog';
import TemplateModel from '@src/api/models/TemplateModel';

const BulkSendTemplateDialog = ({
	open,
	setOpen,
	setBulkSendPayload,
	setSelectionModeEnabled,
	isTemplatesFailed,
	isLoadingTemplates,
	sendCallback,
}) => {
	const { t } = useTranslation();

	const [chosenTemplate, setChosenTemplate] = useState();
	const [isSendTemplateDialogVisible, setSendTemplateDialogVisible] =
		useState(false);

	const close = () => {
		setOpen(false);
	};

	const bulkSendMessage = (type, payload) => {
		setSelectionModeEnabled(true);
		setBulkSendPayload(payload);

		sendCallback?.();
	};

	return (
		<Dialog open={open} onClose={close} className="sendBulkTemplateDialog">
			<DialogTitle>{t('Bulk send a template')}</DialogTitle>
			<DialogContent className="sendBulkTemplateDialogContent">
				<TemplateListWithControls
					isTemplatesFailed={isTemplatesFailed}
					isLoadingTemplates={isLoadingTemplates}
					onSelect={(template: TemplateModel) => {
						setChosenTemplate(template);
						setSendTemplateDialogVisible(true);
					}}
					isBulkOnly={true}
				/>

				<SendTemplateDialog
					isVisible={isSendTemplateDialogVisible}
					setVisible={setSendTemplateDialogVisible}
					chosenTemplate={chosenTemplate}
					onSend={(templateMessage) =>
						sendTemplateMessage(true, templateMessage)
					}
					onBulkSend={bulkSendMessage}
					sendCallback={close}
					isBulkOnly={true}
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
