import React, { useRef, useState } from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import { Button, Dialog } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import { useTranslation } from 'react-i18next';
import { csvToArray } from '../helpers/CSVHelper';
import { preparePhoneNumber } from '../helpers/PhoneNumberHelper';
import FileInput from './FileInput';
import { Alert, AlertTitle } from '@material-ui/lab';
import TemplatesList from './TemplatesList';
import '../styles/BulkSendTemplateViaCSV.css';
import { generateTemplateParamsByValues } from '../helpers/TemplateMessageHelper';

const BulkSendTemplateViaCSV = ({ open, setOpen, templates }) => {
	const { t } = useTranslation();

	const [data, setData] = useState();

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

			setData(finalRows);

			console.log(finalRows);
		});
	};

	const close = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onClose={close} className="bulkSendTemplateViaCSV">
			<DialogTitle>{t('Bulk send template via CSV')}</DialogTitle>
			<DialogContent className="sendBulkVoiceMessageDialogContent">
				{!data && (
					<div>
						{t(
							'You can upload a CSV file that contains a phone number and template parameters in every row.'
						)}
					</div>
				)}
				{data?.length > 0 && (
					<>
						<Alert
							severity="success"
							style={{
								alignSelf: 'stretch',
							}}
						>
							<AlertTitle>{t('Success')}</AlertTitle>
							{t('Imported data for %d receiver(s).', data?.length)}
						</Alert>

						<div className="bulkSendTemplateViaCSV__templatesOuterWrapper">
							<div className="bulkSendTemplateViaCSV__templatesWrapper">
								<TemplatesList
									templates={templates}
									onClick={(templateData) =>
										generateTemplateParamsByValues(templateData, data[0])
									}
								/>
							</div>
						</div>
					</>
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
