import {
	MAX_BULK_DIRECT_RECIPIENTS_DEFAULT,
	MAX_BULK_TAG_RECIPIENTS_DEFAULT,
} from '../Constants';
import { isString } from './Helpers';
import globalConfig from 'react-global-configuration';

export const prepareValue = (configValue, defaultValue) => {
	if (configValue) {
		if (isString(configValue)) {
			const parsed = parseInt(configValue);
			return !isNaN(parsed) ? parsed : defaultValue;
		}

		return configValue;
	}

	return defaultValue;
};

export const getMaxDirectRecipients = () => {
	console.log(globalConfig.get()?.APP_MAX_BULK_DIRECT_RECIPIENTS);
	return prepareValue(
		globalConfig.get()?.APP_MAX_BULK_DIRECT_RECIPIENTS,
		MAX_BULK_DIRECT_RECIPIENTS_DEFAULT
	);
};

export const getMaxTagRecipients = () => {
	return prepareValue(
		globalConfig.get()?.APP_MAX_BULK_TAG_RECIPIENTS,
		MAX_BULK_TAG_RECIPIENTS_DEFAULT
	);
};
