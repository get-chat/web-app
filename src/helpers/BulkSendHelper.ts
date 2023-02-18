// @ts-nocheck
import {
	MAX_BULK_DIRECT_RECIPIENTS_DEFAULT,
	MAX_BULK_TAG_RECIPIENTS_DEFAULT,
} from '../Constants';
import { isString } from './Helpers';

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
	return prepareValue(
		window.config.APP_MAX_BULK_DIRECT_RECIPIENTS,
		MAX_BULK_DIRECT_RECIPIENTS_DEFAULT
	);
};

export const getMaxTagRecipients = () => {
	return prepareValue(
		window.config.APP_MAX_BULK_TAG_RECIPIENTS,
		MAX_BULK_TAG_RECIPIENTS_DEFAULT
	);
};
