// @ts-nocheck
import TemplateModel from '../models/TemplateModel';

class TemplatesResponse {
	constructor(data) {
		const templates = {};
		data.results.forEach((templateData) => {
			const prepared = new TemplateModel(templateData);

			if (prepared.status === 'approved') {
				templates[prepared.name] = prepared;
			}
		});
		this.templates = templates;
	}
}

export default TemplatesResponse;
