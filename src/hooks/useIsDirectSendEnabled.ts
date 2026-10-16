import { useContext } from 'react';
import { AppConfigContext } from '@src/contexts/AppConfigContext';
import { isDirectSendEnabled } from '@src/helpers/ConfigHelper';

export const useIsDirectSendEnabled = () =>
	isDirectSendEnabled(useContext(AppConfigContext));
