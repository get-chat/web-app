interface TemplateParameter {
	type: 'text' | 'currency' | 'date_time' | 'image' | 'video' | 'document';
	text?: string; // For text placeholders
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

export default TemplateParameter;
