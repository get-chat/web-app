import React, { useEffect, useRef, useState } from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import { Button, Dialog } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import { useTranslation } from 'react-i18next';
import { csvToObj } from '../../helpers/CSVHelper';
import FileInput from '../FileInput';
import '../../styles/BulkSendTemplateViaCSV.css';
import {
	generateFinalTemplateParams,
	generateTemplateParamsByValues,
} from '../../helpers/TemplateMessageHelper';
import { isEmptyString } from '../../helpers/Helpers';
import { hasDuplicates } from '../../helpers/ArrayHelper';
import StepUploadCSV from './components/StepUploadCSV';
import StepPreviewCSVData from './components/StepPreviewCSVData';
import StepSelectPrimaryKey from './components/StepSelectPrimaryKey';
import StepSelectTemplate from './components/StepSelectTemplate';
import StepSelectParameters from './components/StepSelectParameters';
import StepPreviewResult from './components/StepPreviewResult';
import { BreakException } from '../../Constants';
import BulkSendStepper from './components/BulkSendStepper';

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
	const [paramsError, setParamsError] = useState();
	const [templateWithParams, setTemplateWithParams] = useState();
	const [primaryKeyColumn, setPrimaryKeyColumn] = useState('');
	const [primaryKeyType, setPrimaryKeyType] = useState(PRIMARY_KEY_TYPE_WA_ID);

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

		console.log(finalData);

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

	const handleNext = () => {
		switch (activeStep) {
			case STEP_UPLOAD_CSV:
				csvFileInput.current.click();
				break;
			case STEP_PREVIEW_RESULT:
				// TODO: Bulk send template
				close();
				break;
			case STEP_SELECT_PARAMETERS:
				prepareTemplateMessage();
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
			setPrimaryKeyType(PRIMARY_KEY_TYPE_WA_ID);
			setActiveStep(STEP_UPLOAD_CSV);
		}
	}, [open]);

	const close = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onClose={close} className="bulkSendTemplateViaCSV">
			<DialogTitle>{t('Bulk send a template via CSV')}</DialogTitle>
			<DialogContent>
				<BulkSendStepper t={t} activeStep={activeStep} />

				{activeStep === STEP_UPLOAD_CSV && (
					<StepUploadCSV t={t} csvError={csvError} />
				)}
				{activeStep === STEP_PREVIEW_CSV_DATA && (
					<StepPreviewCSVData t={t} csvHeader={csvHeader} csvData={csvData} />
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
						selectTemplate={selectTemplate}
					/>
				)}
				{activeStep === STEP_SELECT_PARAMETERS && (
					<StepSelectParameters
						t={t}
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
						t={t}
						templates={templates}
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
