import React from 'react';
import Alert from '@mui/material/Alert';
import TemplatesList from '../TemplatesList';
import { useTranslation } from 'react-i18next';
import TemplateModel from '@src/api/models/TemplateModel';
import { useAppSelector } from '@src/store/hooks';

export type Props = {
	isTemplatesFailed: boolean;
	onSelect: (template: TemplateModel) => void;
};

const TemplateListWithControls: React.FC<Props> = ({
	isTemplatesFailed,
	onSelect,
}) => {
	const { t } = useTranslation();
	const { isLoadingTemplates } = useAppSelector((state) => state.UI);

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

export default TemplateListWithControls;
