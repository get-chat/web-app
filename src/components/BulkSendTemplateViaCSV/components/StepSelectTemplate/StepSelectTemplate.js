import React from 'react';
import TemplatesList from '../../../TemplatesList';

const StepSelectTemplate = ({ t, templates, prepareTemplateMessages }) => {
	return (
		<div>
			<TemplatesList
				templates={templates}
				onClick={(template) => prepareTemplateMessages(template)}
				customSelectButtonTitle={t('Select')}
				isTemplatesFailed={false}
			/>
		</div>
	);
};

export default StepSelectTemplate;
