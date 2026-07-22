export interface Template {
	id?: string;
	name: string;
	category: string;
	// Meta format uses a plain string (e.g. "en_US"), message payloads use { code }
	language: TemplateLanguage | string;
	components: TemplateComponent[] | null;
	status: string;
	parameter_format?: 'POSITIONAL' | 'NAMED' | string;
	previous_category?: string;
	sub_category?: string;
	rejected_reason?: string;
	quality_score?: TemplateQualityScore;
	library_template_name?: string;
	message_send_ttl_seconds?: number;
	// Legacy (360dialog normalized format), no longer sent by the API
	namespace?: string;
	params?: any;
}

export interface TemplateLanguage {
	code: string;
}

export interface TemplateQualityScore {
	date?: number;
	reason?: string;
	reasons?: string[];
	score?: string;
}

export interface TemplateComponent {
	type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTON' | 'BUTTONS';
	format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION';
	index?: number;
	text?: string;
	image?: object;
	video?: object;
	document?: object;
	buttons?: any[];
	parameters?: any[];
	example?: TemplateComponentExample;
	add_security_recommendation?: boolean;
	code_expiration_minutes?: number;
}

export interface TemplateComponentExample {
	body_text?: string[][];
	header_handle?: string[];
	header_text?: string[];
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

export interface CreateTemplateResponse {
	id: string;
	status: string;
	category: string;
}

export interface CheckTemplateRefreshStatusResponse {
	currently_refreshing: boolean;
}

export type TemplateList = {
	[key: string]: Template;
};
