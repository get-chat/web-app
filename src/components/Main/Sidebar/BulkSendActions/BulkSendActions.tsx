import React from 'react';
import { Button } from '@mui/material';
import styles from './BulkSendActions.module.css';
import { Trans, useTranslation } from 'react-i18next';

interface Props {
	selectedChats: string[];
	selectedTags: number[];
	finishBulkSendMessage: () => void;
	cancelSelection: () => void;
	setUploadRecipientsCSVVisible: (value: boolean) => void;
}

const BulkSendActions: React.FC<Props> = ({
	selectedChats,
	selectedTags,
	finishBulkSendMessage,
	cancelSelection,
	setUploadRecipientsCSVVisible,
}) => {
	const { t } = useTranslation();
	return (
		<div className={styles.container}>
			<h3>{t('Bulk Send')}</h3>

			<div className={styles.recipients}>
				<Trans
					values={{
						postProcess: 'sprintf',
						sprintf: {
							contacts_count: selectedChats.length,
							tags_count: selectedTags.length,
						},
					}}
				>
					Selected %(contacts_count)d contact(s) and %(tags_count)d tag(s).
				</Trans>
			</div>

			<div className={styles.actions}>
				<Button color="secondary" onClick={cancelSelection}>
					{t('Cancel')}
				</Button>

				<Button
					color="secondary"
					onClick={() => setUploadRecipientsCSVVisible(true)}
				>
					{t('Upload CSV')}
				</Button>

				<Button color="primary" onClick={finishBulkSendMessage}>
					{t('Send')}
				</Button>
			</div>
		</div>
	);
};

export default BulkSendActions;
