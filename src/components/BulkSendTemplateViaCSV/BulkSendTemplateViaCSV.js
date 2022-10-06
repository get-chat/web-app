import React, { useEffect, useRef, useState } from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import { Button, Dialog, Step, StepLabel, Stepper } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import { useTranslation } from 'react-i18next';
import { csvToObj } from '../../helpers/CSVHelper';
import { preparePhoneNumber } from '../../helpers/PhoneNumberHelper';
import FileInput from '../FileInput';
import '../../styles/BulkSendTemplateViaCSV.css';
import { generateTemplateParamsByValues } from '../../helpers/TemplateMessageHelper';
import { isEmptyString } from '../../helpers/Helpers';
import { hasDuplicates } from '../../helpers/ArrayHelper';
import StepUploadCSV from './components/StepUploadCSV';
import StepPreviewCSVData from './components/StepPreviewCSVData';
import StepSelectPrimaryKey from './components/StepSelectPrimaryKey';
import StepSelectTemplate from './components/StepSelectTemplate';
import StepSelectParameters from './components/StepSelectParameters';
import StepPreviewResult from './components/StepPreviewResult';

export const PRIMARY_KEY_TYPE_WA_ID = 'wa_id';
export const PRIMARY_KEY_TYPE_TAG = 'tag';

const BulkSendTemplateViaCSV = ({ open, setOpen, templates }) => {
	const STEP_UPLOAD_CSV = 0;
	const STEP_PREVIEW_CSV_DATA = 1;
	const STEP_SELECT_PRIMARY_KEY = 2;
	const STEP_SELECT_TEMPLATE = 3;
	const STEP_SELECT_PARAMETERS = 4;
	const STEP_PREVIEW_RESULT = 5;

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

		setActiveStep(STEP_SELECT_PARAMETERS);

		console.log(finalData);
	};

	function getSteps() {
		return [
			t('Upload a CSV file'),
			t('Preview the data'),
			t('Select the primary key'),
			t('Select a template'),
			t('Select the parameters'),
			t('Preview'),
		];
	}

	const updateParam = (values, index, paramKey) => {
		setParams((prevState) => {
			const nextState = prevState;
			// TODO: Combine values with the chosen separator
			// TODO: Convert values to get.chat custom parameters
			nextState[index][paramKey].text = Array.isArray(values)
				? values.join(' ')
				: values;

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
					<StepUploadCSV t={t} csvError={csvError} />
				)}
				{activeStep === STEP_PREVIEW_CSV_DATA && (
					<StepPreviewCSVData csvHeader={csvHeader} csvData={csvData} />
				)}
				{activeStep === STEP_SELECT_PRIMARY_KEY && (
					<StepSelectPrimaryKey
						t={t}
						csvHeader={csvHeader}
						primaryKeyColumn={primaryKeyColumn}
						setPrimaryKeyColumn={setPrimaryKeyColumn}
						primaryKeyType={primaryKeyType}
						setPrimaryKeyType={setPrimaryKeyType}
					/>
				)}
				{activeStep === STEP_SELECT_TEMPLATE && (
					<StepSelectTemplate
						t={t}
						templates={templates}
						prepareTemplateMessages={prepareTemplateMessages}
					/>
				)}
				{activeStep === STEP_SELECT_PARAMETERS && (
					<StepSelectParameters
						csvHeader={csvHeader}
						template={template}
						params={params}
						updateParam={updateParam}
					/>
				)}
				{activeStep === STEP_SELECT_PARAMETERS && <StepPreviewResult />}
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
