import { AppConfig } from '@src/config/application';
import { User } from '@src/types/users';

const isFlagEnabled = (value: string | undefined) =>
	['true', '1'].includes(value?.toLowerCase() ?? '');

export const isReadOnlyConfig = (config: AppConfig | null) =>
	isFlagEnabled(config?.APP_IS_READ_ONLY);

export const isRegularUserActionsRestricted = (
	config: AppConfig | null,
	currentUser: User | null | undefined
) => {
	if (!isFlagEnabled(config?.APP_IS_REGULAR_USER_ACTIONS_RESTRICTED))
		return false;
	return currentUser?.profile?.role !== 'admin';
};
