// @ts-nocheck
import React from 'react';
import { Button } from '@mui/material';
import styles from './ExportChatActions.module.css';
import { Trans, useTranslation } from 'react-i18next';

function ExportChatActions(props) {
	const { t } = useTranslation();
	return (
		<div className={styles.container}>
			<h3>{t('Export Chat')}</h3>

			<div className={styles.recipients}>
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

			<div className={styles.actions}>
				<Button color="secondary" onClick={props.cancelSelection}>
					{t('Cancel')}
				</Button>

				<Button color="primary" onClick={props.finishBulkSendMessage}>
					{t('Export')}
				</Button>
			</div>
		</div>
	);
}

export default ExportChatActions;
