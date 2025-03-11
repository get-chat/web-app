interface TemplateComponent {
	type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTON';
	format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
	text?: object;
	image?: object;
	video?: object;
	document?: object;
	buttons?: any[];
}

export default TemplateComponent;
