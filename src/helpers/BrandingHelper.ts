import { Branding } from '@src/types/branding';

// What the app shows (MT 5.3): a REACT_APP_* value a forked build sets wins,
// then the inbox's branding from the backend, then the app's own default.

export const getBrandTitle = (branding?: Branding) =>
	process.env.REACT_APP_TITLE ?? `${branding?.name || 'get.chat'} Inbox`;

export const getLogoUrl = (branding?: Branding) =>
	process.env.REACT_APP_LOGO_URL ?? (branding?.logo_url || '/logo.png');

// On the loading screen's light background: the inbox's logo, if it has one
export const getDarkLogoUrl = (branding?: Branding) =>
	process.env.REACT_APP_LOGO_BLACK_URL ??
	(branding?.logo_url || '/logoblack.svg');

export const getFaviconUrl = (branding?: Branding) =>
	process.env.REACT_APP_FAVICON_URL ??
	(branding?.favicon_url || '/favicon.png');
