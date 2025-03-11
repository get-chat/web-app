import React from 'react';
import TemplatesList from '../../../TemplatesList';
import { useTranslation } from 'react-i18next';
import TemplateModel from '@src/api/models/TemplateModel';

interface Props {
	selectTemplate: (template: TemplateModel) => void;
}

const StepSelectTemplate: React.FC<Props> = ({ selectTemplate }) => {
	const { t } = useTranslation();

	return (
		<TemplatesList
			onClick={(template) => selectTemplate(template)}
			customSelectButtonTitle={t('Select')}
			isTemplatesFailed={false}
		/>
	);
};

export default StepSelectTemplate;
