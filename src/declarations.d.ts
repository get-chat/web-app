export {};

declare global {
	interface Window {
		config: any;
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
