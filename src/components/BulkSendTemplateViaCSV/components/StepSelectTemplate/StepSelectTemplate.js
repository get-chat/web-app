import React from 'react';
import TemplatesList from '../../../TemplatesList';

const StepSelectTemplate = ({ templates, prepareTemplateMessages }) => {
	return (
		<div className="bulkSendTemplateViaCSV__templatesOuterWrapper">
			<div className="bulkSendTemplateViaCSV__templatesWrapper">
				<TemplatesList
					templates={templates}
					onClick={(template) => prepareTemplateMessages(template)}
				/>
			</div>
		</div>
	);
};

export default StepSelectTemplate;
