import * as Sentry from '@sentry/browser';

export const binaryToBase64 = (data) => {
	try {
		return btoa(
			new Uint8Array(data).reduce(
				(data, byte) => data + String.fromCharCode(byte),
				''
			)
		);
	} catch (error) {
		Sentry.captureException(error);
	}
};
