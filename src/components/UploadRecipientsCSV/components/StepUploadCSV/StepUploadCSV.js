import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useTranslation } from 'react-i18next';
import {
	getMaxDirectRecipients,
	getMaxTagRecipients,
} from '../../../../helpers/BulkSendHelper';

const StepUploadCSV = ({ csvError }) => {
	const { t } = useTranslation();

	return (
		<>
			<p>{t('Please upload a CSV file containing the recipients.')}</p>
			<p className={'mt-3'}>
				{t(
					'The CSV file you upload must contain canonical phone numbers or tags representing recipients.'
				)}
			</p>
			<Alert severity="info" className="mt-3">
				{t(
					'Please upload a CSV file that contains either up to %s direct recipients or tags that target up to %s recipients in total.',
					getMaxDirectRecipients(),
					getMaxTagRecipients()
				)}
			</Alert>
			{csvError !== undefined && (
				<Alert severity="error" className="bulkSendTemplateViaCSV__csvError">
					<AlertTitle>{t('Error')}</AlertTitle>
					{csvError}
				</Alert>
			)}
		</>
	);
};

export default StepUploadCSV;
