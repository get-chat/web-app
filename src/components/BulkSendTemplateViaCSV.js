import React, { useEffect, useRef, useState } from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import {
	Button,
	Dialog,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Step,
	StepLabel,
	Stepper,
} from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import { useTranslation } from 'react-i18next';
import { csvToObj } from '../helpers/CSVHelper';
import { preparePhoneNumber } from '../helpers/PhoneNumberHelper';
import FileInput from './FileInput';
import TemplatesList from './TemplatesList';
import '../styles/BulkSendTemplateViaCSV.css';
import {
	generateTemplateParamsByValues,
	getTemplateParams,
	templateParamToInteger,
} from '../helpers/TemplateMessageHelper';

const BulkSendTemplateViaCSV = ({ open, setOpen, templates }) => {
	const { t } = useTranslation();

	const [activeStep, setActiveStep] = React.useState(0);
	const [csvHeader, setCsvHeader] = useState();
	const [csvData, setCsvData] = useState();
	const [template, setTemplate] = useState();
	const [params, setParams] = useState({});

	const csvFileInput = useRef();

	const handleCSV = (file) => {
		if (!file) return;

		csvToObj(file[0], (result) => {
			const finalData = [];

			// Extract and collect phone numbers
			result.data.forEach((row) => {
				if (row.length > 0) {
					// Extract only digits
					const waId = preparePhoneNumber(row[0]);
					if (waId) {
						// Replace original phone number with prepared wa id
						row[0] = waId;
						// Collect rows if they contain a proper phone number
						finalData.push(row);
					}
				}
			});

			setCsvHeader(result.header);
			setCsvData(finalData);

			setActiveStep(finalData.length > 0 ? 1 : 0);
		});
	};

	const prepareTemplateMessages = (template) => {
		setTemplate(template);

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
			setCsvHeader(undefined);
			setCsvData(undefined);
			setTemplate(undefined);
			setParams({});
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
				{activeStep === 2 && (
					<div>
						{template?.components.map((comp, index) => (
							<>
								{comp.text}
								<div>
									{getTemplateParams(comp.text).map((param, paramIndex) => (
										<FormControl key={paramIndex}>
											<InputLabel>{param}</InputLabel>
											<Select
												value={
													params[index]
														? params[index][templateParamToInteger(param)].text
														: ''
												}
												onChange={(event) => console.log(event)}
											>
												{csvHeader?.map((headerItem, headerIndex) => (
													<MenuItem key={headerIndex} value={headerItem}>
														{headerItem}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									))}
								</div>
							</>
						))}
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
