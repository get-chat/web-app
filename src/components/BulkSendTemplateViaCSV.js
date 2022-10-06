import React, { useEffect, useRef, useState } from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import {
	Button,
	Dialog,
	FormControl,
	FormControlLabel,
	FormLabel,
	InputLabel,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	Step,
	StepLabel,
	Stepper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
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
import { isEmptyString } from '../helpers/Helpers';
import { Alert, AlertTitle } from '@material-ui/lab';
import { hasDuplicates } from '../helpers/ArrayHelper';

const BulkSendTemplateViaCSV = ({ open, setOpen, templates }) => {
	const STEP_UPLOAD_CSV = 0;
	const STEP_PREVIEW_CSV_DATA = 1;
	const STEP_SELECT_PRIMARY_KEY = 2;
	const STEP_SELECT_TEMPLATE = 3;
	const STEP_PREVIEW_RESULT = 4;

	const PRIMARY_KEY_TYPE_WA_ID = 'wa_id';
	const PRIMARY_KEY_TYPE_TAG = 'tag';

	const { t } = useTranslation();

	const [activeStep, setActiveStep] = React.useState(STEP_UPLOAD_CSV);
	const [csvHeader, setCsvHeader] = useState();
	const [csvData, setCsvData] = useState();
	const [csvError, setCsvError] = useState();
	const [template, setTemplate] = useState();
	const [params, setParams] = useState({});
	const [primaryKeyColumn, setPrimaryKeyColumn] = useState('');
	const [primaryKeyType, setPrimaryKeyType] = useState(PRIMARY_KEY_TYPE_WA_ID);

	const csvFileInput = useRef();

	const handleCSV = (file) => {
		if (!file) return;

		setCsvError(undefined);

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

			let hasHeaderError = false;

			if (result.header.length === 0) {
				setCsvError(t('Empty file!'));
				hasHeaderError = true;
			}

			if (hasDuplicates(result.header)) {
				setCsvError(t('Headers must have a unique name!'));
				hasHeaderError = true;
			}

			for (let i = 0; i < result.header.length; i++) {
				if (isEmptyString(result.header[i])) {
					setCsvError(t('Empty header name!'));
					hasHeaderError = true;
					break;
				}
			}

			// If CSV file has errors
			if (hasHeaderError) {
				setActiveStep(STEP_UPLOAD_CSV);
				return;
			}

			setCsvHeader(result.header);
			setCsvData(finalData);
			setPrimaryKeyColumn(result.header[0]);

			setActiveStep(
				finalData.length > 0 ? STEP_PREVIEW_CSV_DATA : STEP_UPLOAD_CSV
			);
		});
	};

	const prepareTemplateMessages = (template) => {
		setTemplate(template);
		setParams(generateTemplateParamsByValues(template, undefined));

		const finalData = [];
		csvData?.forEach((curData) => {
			// TODO: Inject parameters into template data
			finalData.push(generateTemplateParamsByValues(template, curData));
		});

		setActiveStep(STEP_PREVIEW_RESULT);

		console.log(finalData);
	};

	function getSteps() {
		return [
			t('Upload a CSV file'),
			t('Preview CSV data'),
			t('Select the primary key column'),
			t('Select a template'),
			t('Preview'),
		];
	}

	const updateParam = (event, index, paramKey) => {
		setParams((prevState) => {
			const nextState = prevState;
			nextState[index][paramKey].text = event.target.value;

			return { ...nextState };
		});
	};

	const handleNext = () => {
		switch (activeStep) {
			case STEP_UPLOAD_CSV:
				csvFileInput.current.click();
				break;
			case STEP_PREVIEW_RESULT:
				// TODO: Bulk send template
				close();
				break;
			default:
				setActiveStep((prevState) => prevState + 1);
				return;
		}
	};

	const getNextButtonTitle = () => {
		switch (activeStep) {
			case STEP_UPLOAD_CSV:
				return t('Upload CSV');
			case STEP_PREVIEW_RESULT:
				return t('Send');
			default:
				return t('Next');
		}
	};

	const getNextButtonEnabled = () => {
		switch (activeStep) {
			case STEP_SELECT_PRIMARY_KEY:
				return !isEmptyString(primaryKeyColumn);
			default:
				return true;
		}
	};

	useEffect(() => {
		// Resetting state on close
		if (!open) {
			setCsvHeader(undefined);
			setCsvData(undefined);
			setCsvError(undefined);
			setTemplate(undefined);
			setParams({});
			setPrimaryKeyColumn('');
			setPrimaryKeyType(PRIMARY_KEY_TYPE_WA_ID);
			setActiveStep(STEP_UPLOAD_CSV);
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

				{activeStep === STEP_UPLOAD_CSV && (
					<div>
						<div>
							{t(
								'You can upload a CSV file that contains a phone number and template parameters in every row.'
							)}
						</div>
						{csvError !== undefined && (
							<Alert
								severity="error"
								className="bulkSendTemplateViaCSV__csvError"
							>
								<AlertTitle>{t('Error')}</AlertTitle>
								{csvError}
							</Alert>
						)}
					</div>
				)}
				{activeStep === STEP_PREVIEW_CSV_DATA && (
					<div>
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
										{csvHeader?.map((headerItem, headerIndex) => (
											<TableCell key={headerIndex}>{headerItem}</TableCell>
										))}
									</TableRow>
								</TableHead>
								<TableBody>
									{csvData?.map((row, rowIndex) => (
										<TableRow key={rowIndex}>
											{row?.map((column, columnIndex) => (
												<TableCell key={columnIndex} component="th" scope="row">
													{column}
												</TableCell>
											))}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</div>
				)}
				{activeStep === STEP_SELECT_PRIMARY_KEY && (
					<div>
						<FormControl>
							<FormLabel>
								{t('Select the column that contains phone numbers or tags')}
							</FormLabel>
							<RadioGroup
								aria-label="primary-key"
								value={primaryKeyColumn}
								onChange={(event) => setPrimaryKeyColumn(event.target.value)}
								row
							>
								{csvHeader
									?.filter((headerColumn) => !isEmptyString(headerColumn))
									?.map((headerColumn, headerColumnIndex) => (
										<FormControlLabel
											value={headerColumn}
											control={<Radio />}
											label={headerColumn}
											key={headerColumnIndex}
										/>
									))}
							</RadioGroup>
						</FormControl>

						<FormControl>
							<FormLabel>{t('Select the type of receivers')}</FormLabel>
							<RadioGroup
								aria-label="primary-key"
								value={primaryKeyType}
								onChange={(event) => setPrimaryKeyType(event.target.value)}
								row
							>
								<FormControlLabel
									value={PRIMARY_KEY_TYPE_WA_ID}
									control={<Radio />}
									label={t('Phone numbers (canonical)')}
								/>
								<FormControlLabel
									value={PRIMARY_KEY_TYPE_TAG}
									control={<Radio />}
									label={t('Tags')}
								/>
							</RadioGroup>
						</FormControl>
					</div>
				)}
				{activeStep === STEP_SELECT_TEMPLATE && (
					<div className="bulkSendTemplateViaCSV__templatesOuterWrapper">
						<div className="bulkSendTemplateViaCSV__templatesWrapper">
							<TemplatesList
								templates={templates}
								onClick={(template) => prepareTemplateMessages(template)}
							/>
						</div>
					</div>
				)}
				{activeStep === STEP_PREVIEW_RESULT && (
					<div>
						{template?.components.map((comp, compIndex) => (
							<div key={compIndex}>
								{comp.text}
								<div>
									{getTemplateParams(comp.text).map((param, paramIndex) => (
										<FormControl key={paramIndex}>
											<InputLabel>{param}</InputLabel>
											<Select
												value={
													params[compIndex]
														? params[compIndex][templateParamToInteger(param)]
																.text
														: ''
												}
												onChange={(event) =>
													updateParam(
														event,
														compIndex,
														templateParamToInteger(param)
													)
												}
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
							</div>
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
				<Button
					color="primary"
					onClick={handleNext}
					disabled={!getNextButtonEnabled()}
				>
					{getNextButtonTitle()}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default BulkSendTemplateViaCSV;
