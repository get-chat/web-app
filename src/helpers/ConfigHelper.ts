import { AppConfig } from '@src/config/application';

export const isReadOnly = (config: AppConfig | null) => {
	const value = config?.APP_IS_READ_ONLY?.toLowerCase();
	return ['true', '1'].includes(value ?? '');
};
