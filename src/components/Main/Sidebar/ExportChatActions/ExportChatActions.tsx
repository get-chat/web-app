import React from 'react';
import { Button } from '@mui/material';
import styles from './ExportChatActions.module.css';
import { Trans, useTranslation } from 'react-i18next';

interface Props {
	selectedChats: string[];
	selectedTags: any[];
	onShowDateRange: () => void;
	startDate: Date | undefined;
	endDate: Date | undefined;
	onCancel: () => void;
}

const ExportChatActions: React.FC<Props> = ({
	selectedChats,
	selectedTags,
	onShowDateRange,
	startDate,
	endDate,
	onCancel,
}) => {
	const { t } = useTranslation();
	return (
		<div className={styles.container}>
			<h3>{t('Export Chats')}</h3>

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
				<Button color="secondary" onClick={onCancel}>
					{t('Cancel')}
				</Button>

				<Button color="primary" onClick={onShowDateRange}>
					{t('Select by date')}
				</Button>

				<Button color="primary" onClick={undefined}>
					{t('Export')}
				</Button>
			</div>
		</div>
	);
};

export default ExportChatActions;
