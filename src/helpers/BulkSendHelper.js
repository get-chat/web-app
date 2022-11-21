import {
	APP_MAX_BULK_TAG_RECIPIENTS_DEFAULT,
	MAX_BULK_DIRECT_RECIPIENTS_DEFAULT,
} from '../Constants';
import { isString } from './Helpers';

export const getMaxDirectRecipients = () => {
	const configValue = window.config.APP_MAX_BULK_DIRECT_RECIPIENTS;
	const defaultValue = MAX_BULK_DIRECT_RECIPIENTS_DEFAULT;

	if (configValue) {
		if (isString(configValue)) {
			return parseInt(configValue) ?? defaultValue;
		}

		return configValue;
	}

	return defaultValue;
};

export const getMaxTagRecipients = () => {
	return (
		window.config.APP_MAX_BULK_TAG_RECIPIENTS ??
		APP_MAX_BULK_TAG_RECIPIENTS_DEFAULT
	);
};
