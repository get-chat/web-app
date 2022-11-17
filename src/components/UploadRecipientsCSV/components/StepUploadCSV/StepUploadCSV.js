import React from 'react';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import {
	APP_MAX_BULK_TAG_RECIPIENTS_DEFAULT,
	MAX_BULK_DIRECT_RECIPIENTS_DEFAULT,
} from '../../../../Constants';

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
					window.config.APP_MAX_BULK_DIRECT_RECIPIENTS ??
						MAX_BULK_DIRECT_RECIPIENTS_DEFAULT,
					window.config.APP_MAX_BULK_TAG_RECIPIENTS ??
						APP_MAX_BULK_TAG_RECIPIENTS_DEFAULT
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
