import * as Sentry from '@sentry/browser';
import { mimeDB } from './MimeHelper';

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

export const mimeToExtension = (mime) => {
	mime = mime.trim().toLowerCase();
	if (!mimeDB.hasOwnProperty(mime)) return '';
	return mimeDB[mime][0];
};
