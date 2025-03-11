import TemplateModel from '../models/TemplateModel';

export type TemplateList = {
	[key: string]: TemplateModel;
};

class TemplatesResponse {
	public templates: TemplateList = {};

	constructor(data: { results: [] }) {
		const templates: TemplateList = {};
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
