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
import { Trans } from 'react-i18next';
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
		return (
			<div className="recipientsPreview">
				{csvData?.slice(0, 5)?.map((item) => {
					if (primaryKeyType === PRIMARY_KEY_TYPE_TAG) {
						const tagName = item[primaryKeyColumn];
						const tag = tags?.filter(
							(tagItem) => tagItem.name === tagName
						)?.[0];
						return (
							<span>
								<LabelIcon style={{ fill: tag?.web_inbox_color }} />{' '}
								{tagName ? tagName : t('(empty)')}
							</span>
						);
					}

					return (
						<span>
							{item[primaryKeyColumn] ? item[primaryKeyColumn] : t('(empty)')}
						</span>
					);
				})}
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
						<Trans
							values={{
								postProcess: 'sprintf',
								sprintf: [],
							}}
						>
							You will send messages to phone numbers:{' '}
							{prepareRecipientsPreview()}...
						</Trans>
					)}

					{primaryKeyType === PRIMARY_KEY_TYPE_TAG && (
						<Trans
							values={{
								postProcess: 'sprintf',
								sprintf: [],
							}}
						>
							You will send messages to users tagged with:{' '}
							{prepareRecipientsPreview()}
						</Trans>
					)}
				</Alert>
			)}
		</div>
	);
};

export default StepSelectPrimaryKey;
