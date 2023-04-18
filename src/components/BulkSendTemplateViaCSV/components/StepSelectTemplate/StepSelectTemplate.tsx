// @ts-nocheck
import React from 'react';
import TemplatesList from '../../../TemplatesList';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@src/store/hooks';

const StepSelectTemplate = ({ selectTemplate }) => {
	const { t } = useTranslation();

	const templates = useAppSelector((state) => state.templates.value);

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
