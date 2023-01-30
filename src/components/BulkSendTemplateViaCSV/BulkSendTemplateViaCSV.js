import React, { useEffect, useRef, useState } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Button, Dialog } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import { useTranslation } from 'react-i18next';
import { csvToObj } from '@src/helpers/CSVHelper';
import FileInput from '../FileInput';
import '../../styles/BulkSendTemplateViaCSV.css';
import {
	generateFinalTemplateParams,
	generateTemplateParamsByValues,
} from '@src/helpers/TemplateMessageHelper';
import { isEmptyString } from '@src/helpers/Helpers';
import { hasDuplicates } from '@src/helpers/ArrayHelper';
import StepUploadCSV from './components/StepUploadCSV';
import StepPreviewCSVData from './components/StepPreviewCSVData';
import StepSelectPrimaryKey from './components/StepSelectPrimaryKey';
import StepSelectTemplate from './components/StepSelectTemplate';
import StepSelectParameters from './components/StepSelectParameters';
import StepPreviewResult from './components/StepPreviewResult';
import { BreakException } from '@src/Constants';
import BulkSendStepper from './components/BulkSendStepper';
import { prepareWaId } from '@src/helpers/PhoneNumberHelper';
import { generateTemplateMessagePayload } from '@src/helpers/ChatHelper';

export const PRIMARY_KEY_TYPE_WA_ID = 'wa_id';
export const PRIMARY_KEY_TYPE_TAG = 'tag';

const BulkSendTemplateViaCSV = ({ open, setOpen }) => {
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
	const [paramsError, setParamsError] = useState();
	const [templateWithParams, setTemplateWithParams] = useState();
	const [primaryKeyColumn, setPrimaryKeyColumn] = useState('');
	const [primaryKeyType, setPrimaryKeyType] = useState('');

	const csvFileInput = useRef();

	const handleCSV = (file) => {
		if (!file) return;

		setCsvError(undefined);

		csvToObj(file[0], (result) => {
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
			setCsvData(result.data);
			setPrimaryKeyColumn(result.header[0]);

			setActiveStep(
				result.data.length > 0 ? STEP_PREVIEW_CSV_DATA : STEP_UPLOAD_CSV
			);
		});
	};

	const selectTemplate = (template) => {
		setTemplate(template);
		setParams(generateTemplateParamsByValues(template, undefined));

		setActiveStep(STEP_SELECT_PARAMETERS);
	};

	const prepareTemplateMessage = () => {
		let hasError = false;

		const preparedParams = generateFinalTemplateParams(
			template,
			params,
			false,
			(error) => {
				if (error === BreakException) {
					hasError = true;
					setParamsError({
						title: t('Missing parameters'),
						details: t('You need to fill the parameters!'),
					});
				} else {
					throw error;
				}
			}
		);

		if (hasError) return;

		const finalData = { ...template };
		finalData.params = Object.values(preparedParams);

		setTemplateWithParams(finalData);
		setParamsError(undefined);

		setActiveStep(STEP_PREVIEW_RESULT);
	};

	const updateHeaderMediaParam = (value, index, format) => {
		setParams((prevState) => {
			const nextState = prevState;
			nextState[index][0][format.toLowerCase()].link = value;
			return { ...nextState };
		});
	};

	const updateParam = (value, index, paramKey) => {
		setParams((prevState) => {
			const nextState = prevState;
			// Parameter value is an array for multiple choices
			nextState[index][paramKey].text = Array.isArray(value)
				? value.join(' ')
				: value;

			return { ...nextState };
		});
	};

	const send = () => {
		// Preparing recipients
		const recipients = [];
		const format = [];
		csvData?.forEach((dataItem) => {
			let recipient = dataItem[primaryKeyColumn];

			// Formatting if recipients are phone numbers
			if (primaryKeyType === PRIMARY_KEY_TYPE_WA_ID) {
				recipient = prepareWaId(recipient);
			}

			if (recipient) {
				recipients.push({ recipient: recipient });
				const formatItem = {};
				formatItem[primaryKeyType] = recipient;
				format.push({
					...formatItem,
					params: dataItem,
				});
			}
		});

		const payload = {
			...generateTemplateMessagePayload(templateWithParams),
			recipients: recipients,
			format: format,
		};

		// TODO: Bulk send template messages and close the dialog
		//close();
	};

	const handleNext = () => {
		switch (activeStep) {
			case STEP_UPLOAD_CSV:
				csvFileInput.current.click();
				break;
			case STEP_SELECT_PARAMETERS:
				prepareTemplateMessage();
				break;
			case STEP_PREVIEW_RESULT:
				send();
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
				return (
					!isEmptyString(primaryKeyColumn) && !isEmptyString(primaryKeyType)
				);
			case STEP_SELECT_TEMPLATE:
				return false;
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
			setParamsError(undefined);
			setPrimaryKeyColumn('');
			setPrimaryKeyType('');
			setActiveStep(STEP_UPLOAD_CSV);
		}
	}, [open]);

	const close = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onClose={close} className="bulkSendTemplateViaCSV">
			<DialogTitle>{t('Bulk send template with CSV')}</DialogTitle>
			<DialogContent>
				<BulkSendStepper activeStep={activeStep} />

				{activeStep === STEP_UPLOAD_CSV && (
					<StepUploadCSV csvError={csvError} />
				)}
				{activeStep === STEP_PREVIEW_CSV_DATA && (
					<StepPreviewCSVData csvHeader={csvHeader} csvData={csvData} />
				)}
				{activeStep === STEP_SELECT_PRIMARY_KEY && (
					<StepSelectPrimaryKey
						csvHeader={csvHeader}
						csvData={csvData}
						primaryKeyColumn={primaryKeyColumn}
						setPrimaryKeyColumn={setPrimaryKeyColumn}
						primaryKeyType={primaryKeyType}
						setPrimaryKeyType={setPrimaryKeyType}
					/>
				)}
				{activeStep === STEP_SELECT_TEMPLATE && (
					<StepSelectTemplate selectTemplate={selectTemplate} />
				)}
				{activeStep === STEP_SELECT_PARAMETERS && (
					<StepSelectParameters
						csvHeader={csvHeader}
						template={template}
						params={params}
						paramsError={paramsError}
						updateHeaderMediaParam={updateHeaderMediaParam}
						updateParam={updateParam}
					/>
				)}
				{activeStep === STEP_PREVIEW_RESULT && (
					<StepPreviewResult
						template={template}
						params={params}
						csvData={csvData}
					/>
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
