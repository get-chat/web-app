import { Template, TemplateComponent } from '@src/types/templates';

class TemplateModel implements Template {
	public namespace: string;
	public name: string;
	public category: string;
	public components: TemplateComponent[] | null;
	public text: string = '';
	public language: string;
	public status: string;
	public rejected_reason: string;
	public params: any;

	constructor(data: any) {
		this.namespace = data.namespace;
		this.name = data.name;
		this.category = data.category;
		this.components = data.components;

		if (this.components?.length) {
			this.text = data.components[0].text;
		}

		this.rejected_reason = data.rejected_reason;
		this.language = data.language;
		this.status = data.status;
	}
}

export default TemplateModel;
