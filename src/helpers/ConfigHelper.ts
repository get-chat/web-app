import { AppConfig } from '@src/config/application';
import { User } from '@src/types/users';

const isFlagEnabled = (value: string | undefined) =>
	['true', '1'].includes(value?.toLowerCase() ?? '');

export const isReadOnlyConfig = (config: AppConfig | null) =>
	isFlagEnabled(config?.APP_IS_READ_ONLY);

// Shows the "Login with 360dialog" button in the login page. Enabled by
// default (opt-out): only an explicit "false"/"0" hides it. This way existing
// instances get it via a plain image upgrade without setting the backend env
// var — an absent/empty APP_IS_360DIALOG_LOGIN_ENABLED renders empty in
// config.json, which still counts as enabled here.
export const is360dialogLoginEnabled = (config: AppConfig | null) =>
	!['false', '0'].includes(
		config?.APP_IS_360DIALOG_LOGIN_ENABLED?.toLowerCase().trim() ?? ''
	);

export const isRegularUserActionsRestricted = (
	config: AppConfig | null,
	currentUser: User | null | undefined
) => {
	if (!isFlagEnabled(config?.APP_IS_REGULAR_USER_ACTIONS_RESTRICTED))
		return false;
	return currentUser?.profile?.role !== 'admin';
};
