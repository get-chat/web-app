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
import { useAppDispatch } from '@src/store/hooks';
import {
	setBulkSend,
	setSelectionModeEnabled,
} from '@src/store/reducers/UIReducer';
import BulkSendPayload from '@src/interfaces/BulkSendPayload';

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	setBulkSendPayload: (value: BulkSendPayload) => void;
	sendCallback?: () => void;
}

const BulkSendTemplateDialog: React.FC<Props> = ({
	open,
	setOpen,
	setBulkSendPayload,
	sendCallback,
}) => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [chosenTemplate, setChosenTemplate] = useState<TemplateModel>();
	const [isSendTemplateDialogVisible, setSendTemplateDialogVisible] =
		useState(false);

	const close = () => {
		setOpen(false);
	};

	const bulkSendMessage = (type: string, payload: BulkSendPayload) => {
		dispatch(setSelectionModeEnabled(true));
		dispatch(setBulkSend(true));
		setBulkSendPayload(payload);

		sendCallback?.();
	};

	return (
		<Dialog open={open} onClose={close} className="sendBulkTemplateDialog">
			<DialogTitle>{t('Bulk send a template')}</DialogTitle>
			<DialogContent className="sendBulkTemplateDialogContent">
				<TemplateListWithControls
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
