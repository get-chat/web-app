// @ts-nocheck
import React from 'react';
import TemplatesList from '../../../TemplatesList';
import { useTranslation } from 'react-i18next';

const StepSelectTemplate = ({ selectTemplate }) => {
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
