import React from 'react';
import Alert from '@mui/material/Alert';
import TemplatesList from '../../../TemplatesList';
import { useTranslation } from 'react-i18next';
import TemplateModel from '@src/api/models/TemplateModel';

export type Props = {
	isLoadingTemplates: boolean;
	isTemplatesFailed: boolean;
	onSelect: (template: TemplateModel) => void;
};

const TemplateMessages: React.FC<Props> = ({
	isLoadingTemplates,
	isTemplatesFailed,
	onSelect,
}) => {
	const { t } = useTranslation();

	return (
		<div className="templateMessagesOuter">
			{/*<SearchBar />*/}

			{isLoadingTemplates ? (
				<Alert severity="info">{t('Loading template messages...')}</Alert>
			) : (
				<TemplatesList
					onClick={onSelect}
					displayRegisterTemplate={true}
					isTemplatesFailed={isTemplatesFailed}
					customSelectButtonTitle={undefined}
				/>
			)}
		</div>
	);
};

export default TemplateMessages;
