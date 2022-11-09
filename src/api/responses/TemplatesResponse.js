import TemplateModel from '../models/TemplateModel';

class TemplatesResponse {
	constructor(data) {
		const templates = {};
		data.results.forEach((templateData) => {
			templates[templateData.name] = new TemplateModel(templateData);
		});
		this.templates = templates;
	}
}

export default TemplatesResponse;
