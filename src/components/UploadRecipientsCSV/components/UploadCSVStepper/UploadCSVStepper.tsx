import React from 'react';
import { Step, StepLabel, Stepper } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
	activeStep: number;
}

const UploadCSVStepper: React.FC<Props> = ({ activeStep }) => {
	const { t } = useTranslation();

	const steps = [
		t('Upload a CSV file'),
		t('Preview the data'),
		t('Select recipients'),
	];

	return (
		<Stepper activeStep={activeStep} className="mb-3" alternativeLabel>
			{steps.map((label) => (
				<Step key={label}>
					<StepLabel>{label}</StepLabel>
				</Step>
			))}
		</Stepper>
	);
};

export default UploadCSVStepper;
