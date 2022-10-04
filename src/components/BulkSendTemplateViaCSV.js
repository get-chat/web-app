import React, { useEffect, useRef, useState } from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import { Button, Dialog, Step, StepLabel, Stepper } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import { useTranslation } from 'react-i18next';
import { csvToArray } from '../helpers/CSVHelper';
import { preparePhoneNumber } from '../helpers/PhoneNumberHelper';
import FileInput from './FileInput';
import TemplatesList from './TemplatesList';
import '../styles/BulkSendTemplateViaCSV.css';
import { generateTemplateParamsByValues } from '../helpers/TemplateMessageHelper';

const BulkSendTemplateViaCSV = ({ open, setOpen, templates }) => {
	const { t } = useTranslation();

	const [activeStep, setActiveStep] = React.useState(0);
	const [csvData, setCsvData] = useState();

	const csvFileInput = useRef();

	const handleCSV = (file) => {
		if (!file) return;

		csvToArray(file[0], (array) => {
			const finalRows = [];

			// Extract and collect phone numbers
			array.forEach((row) => {
				if (row.length > 0) {
					// Extract only digits
					const waId = preparePhoneNumber(row[0]);
					if (waId) {
						// Replace original phone number with prepared wa id
						row[0] = waId;
						// Collect rows if they contain a proper phone number
						finalRows.push(row);
					}
				}
			});

			setCsvData(finalRows);

			if (finalRows.length > 0) {
				setActiveStep(1);
			}
		});
	};

	const prepareTemplateMessages = (template) => {
		const finalData = [];
		csvData?.forEach((curData) => {
			// TODO: Inject parameters into template data
			finalData.push(generateTemplateParamsByValues(template, curData));
		});

		setActiveStep(2);

		console.log(finalData);
	};

	function getSteps() {
		return [t('Upload a CSV file'), t('Select a template'), t('Preview')];
	}

	useEffect(() => {
		// Resetting state on close
		if (!open) {
			setCsvData(undefined);
			setActiveStep(0);
		}
	}, [open]);

	const close = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onClose={close} className="bulkSendTemplateViaCSV">
			<DialogTitle>{t('Bulk send template via CSV')}</DialogTitle>
			<DialogContent>
				<Stepper activeStep={activeStep} alternativeLabel>
					{getSteps().map((label) => (
						<Step key={label}>
							<StepLabel>{label}</StepLabel>
						</Step>
					))}
				</Stepper>

				{activeStep === 0 && (
					<div>
						{t(
							'You can upload a CSV file that contains a phone number and template parameters in every row.'
						)}
					</div>
				)}
				{activeStep === 1 && (
					<div className="bulkSendTemplateViaCSV__templatesOuterWrapper">
						<div className="bulkSendTemplateViaCSV__templatesWrapper">
							<TemplatesList
								templates={templates}
								onClick={(template) => prepareTemplateMessages(template)}
							/>
						</div>
					</div>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={close} color="secondary">
					{t('Close')}
				</Button>
				<FileInput
					innerRef={csvFileInput}
					multiple={false}
					accept=".csv"
					handleSelectedFiles={handleCSV}
				/>
				<Button color="primary" onClick={() => csvFileInput.current.click()}>
					{t('Upload CSV')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default BulkSendTemplateViaCSV;
