export default interface InteractiveMessageProps {
	header?: {
		text: string;
	};
	body?: {
		text: string;
	};
	footer?: {
		text: string;
	};
	action?: {
		name: string;
		buttons?: any[];
		parameters?: {
			url?: string;
			display_text?: string;
			flow_cta?: string;
		};
		sections?: any[];
		catalog_id?: string;
		product_retailer_id?: string;
	};
}
