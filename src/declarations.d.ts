import { AppConfig } from '@src/config/application';
import { AxiosError } from 'axios';

export {};

declare global {
	interface Window {
		config: AppConfig;
		AndroidWebInterface?: any;
		displayError: (error: AxiosError) => void;
		displayCustomError: (error: string) => void;
		displaySuccess: (message: string) => void;
		goToChatByWaId: (waId: string) => void;
		customStorage: { [key: string]: string };
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
