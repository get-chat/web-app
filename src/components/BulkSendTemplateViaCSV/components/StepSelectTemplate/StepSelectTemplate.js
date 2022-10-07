import React from 'react';
import TemplatesList from '../../../TemplatesList';

const StepSelectTemplate = ({ t, templates, selectTemplate }) => {
	return (
		<div>
			<TemplatesList
				templates={templates}
				onClick={(template) => selectTemplate(template)}
				customSelectButtonTitle={t('Select')}
				isTemplatesFailed={false}
			/>
		</div>
	);
};

export default StepSelectTemplate;
