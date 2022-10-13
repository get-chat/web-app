import React from 'react';
import TemplatesList from '../../../TemplatesList';
import { useTranslation } from 'react-i18next';

const StepSelectTemplate = ({ templates, selectTemplate }) => {
	const { t } = useTranslation();

	return (
		<TemplatesList
			templates={templates}
			onClick={(template) => selectTemplate(template)}
			customSelectButtonTitle={t('Select')}
			isTemplatesFailed={false}
		/>
	);
};

export default StepSelectTemplate;
