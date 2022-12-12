import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, Dialog } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import FileInput from '../FileInput';
import DialogActions from '@mui/material/DialogActions';
import { csvToObj } from '@src/helpers/CSVHelper';
import { hasDuplicates } from '@src/helpers/ArrayHelper';
import { isEmptyString } from '@src/helpers/Helpers';
import { preparePhoneNumber } from '@src/helpers/PhoneNumberHelper';
import {
	PRIMARY_KEY_TYPE_TAG,
	PRIMARY_KEY_TYPE_WA_ID,
} from '../BulkSendTemplateViaCSV/BulkSendTemplateViaCSV';
import UploadCSVStepper from './components/UploadCSVStepper';
import StepPreviewCSVData from '../BulkSendTemplateViaCSV/components/StepPreviewCSVData';
import StepUploadCSV from './components/StepUploadCSV';
import StepSelectPrimaryKey from '../BulkSendTemplateViaCSV/components/StepSelectPrimaryKey';
import { getMaxDirectRecipients } from '@src/helpers/BulkSendHelper';
import { useSelector } from 'react-redux';

const UploadRecipientsCSV = ({ open, setOpen, addBulkSendRecipients }) => {
	const STEP_UPLOAD_CSV = 0;
	const STEP_PREVIEW_CSV_DATA = 1;
	const STEP_SELECT_PRIMARY_KEY = 2;

	const tags = useSelector((state) => state.tags.value);

	const [activeStep, setActiveStep] = React.useState(STEP_UPLOAD_CSV);
	const [csvHeader, setCsvHeader] = useState();
	const [csvData, setCsvData] = useState();
	const [csvError, setCsvError] = useState();
	const [isExceededLimits, setExceededLimits] = useState(false);
	const [primaryKeyColumn, setPrimaryKeyColumn] = useState('');
	const [primaryKeyType, setPrimaryKeyType] = useState('');

	const { t } = useTranslation();

	const csvFileInput = useRef();

	const handleCSV = (file) => {
		if (!file) return;

		setCsvError(undefined);
		setExceededLimits(false);

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

			const maxDirectRecipients = getMaxDirectRecipients();

			// Apply the limits
			if (result.data.length > maxDirectRecipients) {
				setExceededLimits(true);
				result.data = result.data.slice(0, maxDirectRecipients);
			}

			setCsvData(result.data);
			setPrimaryKeyColumn(result.header[0]);

			setActiveStep(
				result.data.length > 0 ? STEP_PREVIEW_CSV_DATA : STEP_UPLOAD_CSV
			);
		});
	};

	const complete = () => {
		// Preparing recipients
		const newWaIds = [];
		const newTags = [];
		csvData?.forEach((dataItem) => {
			let recipient = dataItem[primaryKeyColumn];

			// Formatting if recipients are phone numbers
			if (primaryKeyType === PRIMARY_KEY_TYPE_WA_ID) {
				const formattedWaId = preparePhoneNumber(recipient);
				if (formattedWaId) {
					newWaIds.push(formattedWaId);
				}
			} else if (primaryKeyType === PRIMARY_KEY_TYPE_TAG) {
				newTags.push(recipient);
			}
		});

		addBulkSendRecipients(newWaIds, newTags);
		close();
	};

	const handleNext = () => {
		switch (activeStep) {
			case STEP_UPLOAD_CSV:
				csvFileInput.current.click();
				break;
			case STEP_SELECT_PRIMARY_KEY:
				complete();
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
			case STEP_SELECT_PRIMARY_KEY:
				return t('Done');
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
			setExceededLimits(false);
			setPrimaryKeyColumn('');
			setPrimaryKeyType('');
			setActiveStep(STEP_UPLOAD_CSV);
		}
	}, [open]);

	const close = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onClose={close} className="uploadRecipientsCSV">
			<DialogTitle>{t('Upload CSV')}</DialogTitle>
			<DialogContent>
				<UploadCSVStepper activeStep={activeStep} />

				{activeStep === STEP_UPLOAD_CSV && (
					<StepUploadCSV csvError={csvError} />
				)}
				{activeStep === STEP_PREVIEW_CSV_DATA && (
					<StepPreviewCSVData
						csvHeader={csvHeader}
						csvData={csvData}
						isExceededLimits={isExceededLimits}
					/>
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

export default UploadRecipientsCSV;
