import React from 'react';
import { Button } from '@material-ui/core';
import '../../../styles/BulkSendActions.css';
import { Trans, useTranslation } from 'react-i18next';

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

			<div className="bulkSendActions__actions">
				<Button color="secondary" onClick={props.cancelSelection}>
					{t('Cancel')}
				</Button>
				<Button color="primary" onClick={props.finishBulkSendMessage}>
					{t('Send')}
				</Button>
			</div>
		</div>
	);
}

export default BulkSendActions;
