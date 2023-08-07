import { AppConfig } from '@src/config/application';

export {};

declare global {
	interface Window {
		config: AppConfig;
	}
}

declare module '*.pcss' {
	const content: Record<string, string>;
	export default content;
}

declare module '*.json' {
	interface Json {
		[key: string]: any;
	}

	const classNames: Json;
	export = classNames;
}
