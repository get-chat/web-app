// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import TemplatesList from '../../../TemplatesList';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';
import SendTemplateDialog from '@src/components/SendTemplateDialog';

function TemplateMessages({
	waId,
	onSend,
	sendCallback,
	onBulkSend,
	selectTemplateCallback,
	isLoadingTemplates,
	isTemplatesFailed,
	isBulkOnly,
}) {
	const templates = useAppSelector((state) => state.templates.value);

	const [chosenTemplate, setChosenTemplate] = useState();
	const [isDialogVisible, setDialogVisible] = useState(false);

	const dialogContentRef = useRef();

	const { t } = useTranslation();

	useEffect(() => {
		setDialogVisible(false);
	}, [waId]);

	const showDialog = () => {
		setDialogVisible(true);
	};

	const chooseTemplate = (template) => {
		setChosenTemplate(template);
		showDialog();
	};

	return (
		<div className="templateMessagesOuter">
			{/*<SearchBar />*/}

			{isLoadingTemplates ? (
				<Alert severity="info">{t('Loading template messages...')}</Alert>
			) : (
				<TemplatesList
					templates={templates}
					onClick={(templateData) => chooseTemplate(templateData)}
					displayRegisterTemplate={true}
					isTemplatesFailed={isTemplatesFailed}
				/>
			)}

			<SendTemplateDialog
				isVisible={isDialogVisible}
				setVisible={setDialogVisible}
				chosenTemplate={chosenTemplate}
				onSend={onSend}
				sendCallback={sendCallback}
				onBulkSend={onBulkSend}
				isBulkOnly={isBulkOnly}
				selectTemplateCallback={selectTemplateCallback}
				dialogContentRef={dialogContentRef}
			/>
		</div>
	);
}

export default TemplateMessages;
