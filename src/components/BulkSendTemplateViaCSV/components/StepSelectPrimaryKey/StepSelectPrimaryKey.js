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

const StepSelectPrimaryKey = ({
	t,
	csvHeader,
	primaryKeyColumn,
	setPrimaryKeyColumn,
	primaryKeyType,
	setPrimaryKeyType,
}) => {
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
		</div>
	);
};

export default StepSelectPrimaryKey;
