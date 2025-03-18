export interface Template {
	name: string;
	category: string;
	language: string;
	components: TemplateComponent[];
	namespace: string;
	rejected_reason: string;
	status: string;
}

export interface TemplateComponent {
	type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTON';
	format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
	text?: object;
	image?: object;
	video?: object;
	document?: object;
	buttons?: any[];
}

export interface TemplateParameter {
	type: 'text' | 'currency' | 'date_time' | 'image' | 'video' | 'document';
	text?: string;
	currency?: {
		fallback_value: string;
		code: string;
		amount_1000: number;
	};
	date_time?: {
		fallback_value: string;
	};
	image?: { link: string };
	video?: { link: string };
	document?: { link: string };
}
