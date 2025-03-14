import React from 'react';
import { Button } from '@mui/material';
import styles from './BulkSendActions.module.css';
import { Trans, useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@src/store/hooks';
import { setState } from '@src/store/reducers/UIReducer';

interface Props {
	finishBulkSendMessage: () => void;
	cancelSelection: () => void;
}

const BulkSendActions: React.FC<Props> = ({
	finishBulkSendMessage,
	cancelSelection,
}) => {
	const { t } = useTranslation();
	const { selectedTags, selectedChats } = useAppSelector((state) => state.UI);
	const dispatch = useAppDispatch();

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
					onClick={() =>
						dispatch(setState({ isUploadRecipientsCSVVisible: true }))
					}
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
