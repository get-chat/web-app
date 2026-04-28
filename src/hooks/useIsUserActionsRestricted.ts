import { useContext } from 'react';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { useAppSelector } from '@src/store/hooks';
import { isRegularUserActionsRestricted } from '@src/helpers/ConfigHelper';

export const useIsUserActionsRestricted = () => {
	const config = useContext(AppConfigContext);
	const currentUser = useAppSelector((state) => state.currentUser.value);
	return isRegularUserActionsRestricted(config, currentUser);
};
