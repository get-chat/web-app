import React from 'react';
import { Step, StepLabel, Stepper } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const UploadCSVStepper = ({ activeStep }) => {
	const { t } = useTranslation();

	const steps = [
		t('Upload a CSV file'),
		t('Preview the data'),
		t('Select recipients'),
	];

	return (
		<Stepper activeStep={activeStep} alternativeLabel>
			{steps.map((label) => (
				<Step key={label}>
					<StepLabel>{label}</StepLabel>
				</Step>
			))}
		</Stepper>
	);
};

export default UploadCSVStepper;
