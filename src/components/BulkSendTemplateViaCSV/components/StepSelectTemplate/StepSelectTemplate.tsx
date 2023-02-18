// @ts-nocheck
import React from 'react';
import TemplatesList from '../../../TemplatesList';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const StepSelectTemplate = ({ selectTemplate }) => {
	const { t } = useTranslation();

	const templates = useSelector((state) => state.templates.value);

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
