// https://developers.facebook.com/docs/whatsapp/on-premises/reference/media#supported-files
const WABA_SUPPORT_IMAGE_FORMAT = ['image/jpeg', 'image/png'];
const WABA_SUPPORT_VIDEO_FORMAT = ['video/mp4', 'video/3gpp'];

export const isImageSupported = (mime: string) => {
	return WABA_SUPPORT_IMAGE_FORMAT.includes(mime);
};

export const isVideoSupported = (mime: string) => {
	return WABA_SUPPORT_VIDEO_FORMAT.includes(mime);
};
