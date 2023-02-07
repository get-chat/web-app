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

// https://developers.facebook.com/docs/whatsapp/on-premises/reference/media#supported-files
const WABA_SUPPORT_IMAGE_FORMAT = ['image/jpeg', 'image/png'];

export const isImageSupported = (mime) => {
	return WABA_SUPPORT_IMAGE_FORMAT.includes(mime);
};
