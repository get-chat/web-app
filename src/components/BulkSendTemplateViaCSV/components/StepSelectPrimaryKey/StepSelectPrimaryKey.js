import React from 'react';
import {
	FormControl,
	FormControlLabel,
	FormLabel,
	Radio,
	RadioGroup,
} from '@material-ui/core';
import { isEmptyString } from '../../../../helpers/Helpers';
import {
	PRIMARY_KEY_TYPE_TAG,
	PRIMARY_KEY_TYPE_WA_ID,
} from '../../BulkSendTemplateViaCSV';
import { Alert } from '@material-ui/lab';

const StepSelectPrimaryKey = ({
	t,
	csvHeader,
	csvData,
	primaryKeyColumn,
	setPrimaryKeyColumn,
	primaryKeyType,
	setPrimaryKeyType,
}) => {
	const prepareRecipientsPreview = () => {
		return csvData
			?.slice(0, 5)
			?.map((item) => item[primaryKeyColumn])
			?.join(', ');
	};

	return (
		<div>
			<FormControl>
				<FormLabel>{t('Select the column that contains recipients')}</FormLabel>
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
				<FormLabel>{t('Select the type of recipients')}</FormLabel>
				<RadioGroup
					aria-label="primary-key"
					value={primaryKeyType}
					onChange={(event) => setPrimaryKeyType(event.target.value)}
					row
				>
					<FormControlLabel
						value={PRIMARY_KEY_TYPE_WA_ID}
						control={<Radio />}
						label={t('Phone numbers')}
					/>
					<FormControlLabel
						value={PRIMARY_KEY_TYPE_TAG}
						control={<Radio />}
						label={t('Tags')}
					/>
				</RadioGroup>
			</FormControl>

			{primaryKeyType && (
				<Alert severity="info">
					{primaryKeyType === PRIMARY_KEY_TYPE_WA_ID &&
						t(
							'You will send messages to phone numbers: %s...',
							prepareRecipientsPreview()
						)}

					{primaryKeyType === PRIMARY_KEY_TYPE_TAG &&
						t(
							'You will send messages to users tagged with: %s...',
							prepareRecipientsPreview()
						)}
				</Alert>
			)}
		</div>
	);
};

export default StepSelectPrimaryKey;
