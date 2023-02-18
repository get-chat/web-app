// @ts-nocheck
import React from 'react';
import { Step, StepLabel, Stepper } from '@mui/material';
import { useTranslation } from 'react-i18next';

const BulkSendStepper = ({ activeStep }) => {
	const { t } = useTranslation();

	const steps = [
		t('Upload a CSV file'),
		t('Preview the data'),
		t('Select recipients'),
		t('Select a template'),
		t('Select parameters'),
		t('Preview'),
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

export default BulkSendStepper;
