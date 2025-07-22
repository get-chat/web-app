export interface Template {
	name: string;
	category: string;
	language: TemplateLanguage | string;
	components: TemplateComponent[] | null;
	namespace: string;
	rejected_reason?: string;
	status: string;
	params?: any;
}

export interface TemplateLanguage {
	code: string;
}

export interface TemplateComponent {
	type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTON' | 'BUTTONS';
	format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
	index?: number;
	text?: string;
	image?: object;
	video?: object;
	document?: object;
	buttons?: any[];
	parameters?: any[];
	example?: any;
}

export interface TemplateParameter {
	type: 'text' | 'currency' | 'date_time' | 'image' | 'video' | 'document';
	parameter_name?: string;
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

export interface CheckTemplateRefreshStatusResponse {
	currently_refreshing: boolean;
}

export type TemplateList = {
	[key: string]: Template;
};
