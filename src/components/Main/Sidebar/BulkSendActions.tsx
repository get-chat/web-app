// @ts-nocheck
import React from 'react';
import { Button } from '@mui/material';
import '../../../styles/BulkSendActions.css';
import { Trans, useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import {
	getMaxDirectRecipients,
	getMaxTagRecipients,
} from '@src/helpers/BulkSendHelper';

function BulkSendActions(props) {
	const { t } = useTranslation();
	return (
		<div className="bulkSendActions">
			<h3>{t('Bulk Send')}</h3>

			<div className="bulkSendActions__recipients">
				<Trans
					values={{
						postProcess: 'sprintf',
						sprintf: {
							contacts_count: props.selectedChats.length,
							tags_count: props.selectedTags.length,
						},
					}}
				>
					Selected %(contacts_count)d contact(s) and %(tags_count)d tag(s).
				</Trans>
			</div>

			<Alert severity="info" className="bulkSendActions__maxRecipientsInfo">
				{t(
					'Please select up to %s direct recipients.',
					getMaxDirectRecipients()
				)}
			</Alert>

			<Alert severity="info" className="bulkSendActions__maxRecipientsInfo">
				{t(
					'Please select tags that target up to %s recipients in total.',
					getMaxTagRecipients()
				)}
			</Alert>

			<div className="bulkSendActions__actions">
				<Button color="secondary" onClick={props.cancelSelection}>
					{t('Cancel')}
				</Button>

				<Button
					color="secondary"
					onClick={() => props.setUploadRecipientsCSVVisible(true)}
				>
					{t('Upload CSV')}
				</Button>

				<Button color="primary" onClick={props.finishBulkSendMessage}>
					{t('Send')}
				</Button>
			</div>
		</div>
	);
}

export default BulkSendActions;
