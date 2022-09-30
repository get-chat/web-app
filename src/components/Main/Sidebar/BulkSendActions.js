import React, { useRef } from 'react';
import { Button } from '@material-ui/core';
import '../../../styles/BulkSendActions.css';
import { Trans, useTranslation } from 'react-i18next';
import FileInput from '../../FileInput';
import { csvToArray } from '../../../helpers/CSVHelper';
import { preparePhoneNumber } from '../../../helpers/PhoneNumberHelper';

function BulkSendActions(props) {
	const { t } = useTranslation();

	const csvFileInput = useRef();

	const handleCSV = (file) => {
		if (!file) return;

		csvToArray(file[0], (array) => {
			const waIds = [];

			// Extract and collect phone numbers
			array.forEach((row) => {
				if (row.length > 0) {
					// Extract only digits
					const waId = preparePhoneNumber(row[0]);
					if (waId) {
						waIds.push(waId);
					}
				}
			});

			// Combine with selected chats
			if (waIds.length > 0) {
				props.setSelectedChats([
					...new Set([...waIds, ...props.selectedChats]),
				]);
			}
		});
	};

	return (
		<div className="bulkSendActions">
			<h3>{t('Bulk Send')}</h3>

			<div className="bulkSendActions__recipients">
				<Trans
					values={{
						postProcess: 'sprintf',
						sprintf: {
							contacts_count: props.selectedChats.length,
							tags_count: props.selectedTags.length,
						},
					}}
				>
					Selected %(contacts_count)d contact(s) and %(tags_count)d tag(s).
				</Trans>
			</div>

			<div className="bulkSendActions__actions">
				<Button color="secondary" onClick={props.cancelSelection}>
					{t('Cancel')}
				</Button>

				<FileInput
					innerRef={csvFileInput}
					multiple={false}
					accept=".csv"
					handleSelectedFiles={handleCSV}
				/>
				<Button color="secondary" onClick={() => csvFileInput.current.click()}>
					{t('Upload CSV')}
				</Button>

				<Button color="primary" onClick={props.finishBulkSendMessage}>
					{t('Send')}
				</Button>
			</div>
		</div>
	);
}

export default BulkSendActions;
