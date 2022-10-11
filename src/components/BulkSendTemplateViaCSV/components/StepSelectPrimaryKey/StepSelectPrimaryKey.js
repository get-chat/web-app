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
import LabelIcon from '@material-ui/icons/Label';

const StepSelectPrimaryKey = ({
	t,
	csvHeader,
	csvData,
	tags,
	primaryKeyColumn,
	setPrimaryKeyColumn,
	primaryKeyType,
	setPrimaryKeyType,
}) => {
	const prepareRecipientsPreview = () => {
		const previewLimit = 5;

		return (
			<div className="recipientsPreview">
				{csvData?.slice(0, previewLimit)?.map((item, itemIndex) => {
					if (primaryKeyType === PRIMARY_KEY_TYPE_TAG) {
						const tagName = item[primaryKeyColumn];
						const tag = tags?.filter(
							(tagItem) => tagItem.name === tagName
						)?.[0];
						return (
							<span key={itemIndex}>
								<LabelIcon style={{ fill: tag?.web_inbox_color }} />{' '}
								{tagName ? tagName : t('(empty)')}
							</span>
						);
					}

					return (
						<span key={itemIndex}>
							{item[primaryKeyColumn] ? item[primaryKeyColumn] : t('(empty)')}
						</span>
					);
				})}
				{csvData?.length > previewLimit && (
					<span className="bold">
						{t('+%d more', csvData.length - previewLimit)}
					</span>
				)}
			</div>
		);
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
					{primaryKeyType === PRIMARY_KEY_TYPE_WA_ID && (
						<>{t('You will send messages to phone numbers:')}</>
					)}

					{primaryKeyType === PRIMARY_KEY_TYPE_TAG && (
						<>{t('You will send messages to users tagged with:')}</>
					)}

					{!isEmptyString(primaryKeyType) && <>{prepareRecipientsPreview()}</>}
				</Alert>
			)}
		</div>
	);
};

export default StepSelectPrimaryKey;
