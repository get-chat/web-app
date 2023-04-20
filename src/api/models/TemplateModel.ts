// @ts-nocheck
class TemplateModel {
	public name: string;

	constructor(data) {
		this.namespace = data.namespace;
		this.name = data.name;
		this.category = data.category;
		this.components = data.components;
		this.text = data.components[0].text;
		this.language = data.language;
		this.status = data.status;
	}
}

export default TemplateModel;
