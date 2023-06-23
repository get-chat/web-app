// @ts-nocheck
import React from 'react';
import {
	FormControl,
	FormControlLabel,
	FormLabel,
	Radio,
	RadioGroup,
} from '@mui/material';
import { isEmptyString } from '@src/helpers/Helpers';
import {
	PRIMARY_KEY_TYPE_TAG,
	PRIMARY_KEY_TYPE_WA_ID,
} from '../../BulkSendTemplateViaCSV';
import Alert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';
import styles from './StepSelectPrimaryKey.module.css';
import { findTagByName } from '@src/helpers/TagHelper';
import { useAppSelector } from '@src/store/hooks';
import SellIcon from '@mui/icons-material/Sell';

const StepSelectPrimaryKey = ({
	csvHeader,
	csvData,
	primaryKeyColumn,
	setPrimaryKeyColumn,
	primaryKeyType,
	setPrimaryKeyType,
	isTagsDisabled,
}) => {
	const tags = useAppSelector((state) => state.tags.value);

	const { t } = useTranslation();

	const prepareRecipientsPreview = () => {
		const PREVIEW_LIMIT = 5;

		return (
			<div className={styles.recipientsPreview}>
				{csvData?.slice(0, PREVIEW_LIMIT)?.map((item, itemIndex) => {
					if (primaryKeyType === PRIMARY_KEY_TYPE_TAG) {
						const tagName = item[primaryKeyColumn];
						const tag = findTagByName(tags, tagName);
						return (
							<span key={itemIndex}>
								<SellIcon style={{ fill: tag?.color }} />{' '}
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
				{csvData?.length > PREVIEW_LIMIT && (
					<span className="bold">
						{t('+%d more', csvData.length - PREVIEW_LIMIT)}
					</span>
				)}
			</div>
		);
	};

	return (
		<>
			<FormControl variant="standard">
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

			<FormControl variant="standard">
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
					{!isTagsDisabled && (
						<FormControlLabel
							value={PRIMARY_KEY_TYPE_TAG}
							control={<Radio />}
							label={t('Tags')}
						/>
					)}
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
		</>
	);
};

export default StepSelectPrimaryKey;
