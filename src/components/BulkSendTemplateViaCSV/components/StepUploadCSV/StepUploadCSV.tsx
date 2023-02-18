// @ts-nocheck
import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useTranslation } from 'react-i18next';

const StepUploadCSV = ({ csvError }) => {
	const { t } = useTranslation();

	return (
		<>
			<p>
				{t(
					'Please upload a CSV file containing the data for the message you want to send in bulk.'
				)}
			</p>
			<p className={'mt-3'}>
				{t(
					'The CSV file you upload must contain canonical phone numbers or tags representing recipients. In addition, this file may contain parameter data for the template message you will choose.'
				)}
			</p>
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
