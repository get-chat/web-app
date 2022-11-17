import {
	APP_MAX_BULK_TAG_RECIPIENTS_DEFAULT,
	MAX_BULK_DIRECT_RECIPIENTS_DEFAULT,
} from '../Constants';

export const getMaxDirectRecipients = () => {
	return (
		window.config.APP_MAX_BULK_DIRECT_RECIPIENTS ??
		MAX_BULK_DIRECT_RECIPIENTS_DEFAULT
	);
};

export const getMaxTagRecipients = () => {
	return (
		window.config.APP_MAX_BULK_TAG_RECIPIENTS ??
		APP_MAX_BULK_TAG_RECIPIENTS_DEFAULT
	);
};
