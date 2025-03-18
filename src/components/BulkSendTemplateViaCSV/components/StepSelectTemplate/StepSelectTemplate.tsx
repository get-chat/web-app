import React from 'react';
import TemplatesList from '../../../TemplatesList';
import { useTranslation } from 'react-i18next';
import { Template } from '@src/types/templates';

interface Props {
	selectTemplate: (template: Template) => void;
}

const StepSelectTemplate: React.FC<Props> = ({ selectTemplate }) => {
	const { t } = useTranslation();

	return (
		<TemplatesList
			onClick={(template) => selectTemplate(template)}
			customSelectButtonTitle={t('Select')}
		/>
	);
};

export default StepSelectTemplate;
