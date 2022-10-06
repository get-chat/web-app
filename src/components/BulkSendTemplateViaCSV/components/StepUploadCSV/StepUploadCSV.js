import React from 'react';
import { Alert, AlertTitle } from '@material-ui/lab';

const StepUploadCSV = ({ t, csvError }) => {
	return (
		<div>
			<div>
				{t(
					'You can upload a CSV file that contains a phone number and template parameters in every row.'
				)}
			</div>
			{csvError !== undefined && (
				<Alert severity="error" className="bulkSendTemplateViaCSV__csvError">
					<AlertTitle>{t('Error')}</AlertTitle>
					{csvError}
				</Alert>
			)}
		</div>
	);
};

export default StepUploadCSV;
