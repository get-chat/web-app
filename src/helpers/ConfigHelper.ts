import { AppConfig } from '@src/config/application';
import { User } from '@src/types/users';

export const isReadOnlyConfig = (config: AppConfig | null) => {
	const value = config?.APP_IS_READ_ONLY?.toLowerCase();
	return ['true', '1'].includes(value ?? '');
};

export const isRegularUserActionsRestricted = (
	config: AppConfig | null,
	currentUser: User | null | undefined
) => {
	const value = config?.APP_IS_REGULAR_USER_ACTIONS_RESTRICTED?.toLowerCase();
	const flagEnabled = ['true', '1'].includes(value ?? '');
	if (!flagEnabled) return false;
	return currentUser?.profile?.role !== 'admin';
};
