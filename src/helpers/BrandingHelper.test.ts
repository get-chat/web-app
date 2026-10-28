import {
	getBrandTitle,
	getDarkLogoUrl,
	getFaviconUrl,
	getLogoUrl,
} from '@src/helpers/BrandingHelper';
import { Branding } from '@src/types/branding';

const PARTNER: Branding = {
	name: 'Partner Chat',
	favicon_url: 'https://partner.example/favicon.ico',
	logo_url: 'https://partner.example/logo.png',
};

const UNBRANDED: Branding = { name: 'get.chat', favicon_url: '', logo_url: '' };

const BUILD_VARIABLES = [
	'REACT_APP_TITLE',
	'REACT_APP_LOGO_URL',
	'REACT_APP_LOGO_BLACK_URL',
	'REACT_APP_FAVICON_URL',
];

describe('BrandingHelper', () => {
	afterEach(() => {
		BUILD_VARIABLES.forEach((name) => delete process.env[name]);
	});

	it("shows the app's own until the branding has loaded", () => {
		expect(getBrandTitle(undefined)).toBe('get.chat Inbox');
		expect(getLogoUrl(undefined)).toBe('/logo.png');
		expect(getDarkLogoUrl(undefined)).toBe('/logoblack.svg');
		expect(getFaviconUrl(undefined)).toBe('/favicon.png');
	});

	it("shows the inbox's branding", () => {
		expect(getBrandTitle(PARTNER)).toBe('Partner Chat Inbox');
		expect(getLogoUrl(PARTNER)).toBe('https://partner.example/logo.png');
		expect(getDarkLogoUrl(PARTNER)).toBe('https://partner.example/logo.png');
		expect(getFaviconUrl(PARTNER)).toBe('https://partner.example/favicon.ico');
	});

	it("keeps the app's own images for empty URLs, and the default title", () => {
		expect(getBrandTitle(UNBRANDED)).toBe('get.chat Inbox');
		expect(getLogoUrl(UNBRANDED)).toBe('/logo.png');
		expect(getDarkLogoUrl(UNBRANDED)).toBe('/logoblack.svg');
		expect(getFaviconUrl(UNBRANDED)).toBe('/favicon.png');
	});

	it("lets a forked build's REACT_APP_* values win", () => {
		process.env.REACT_APP_TITLE = 'Fork';
		process.env.REACT_APP_LOGO_URL = '/fork.png';
		process.env.REACT_APP_LOGO_BLACK_URL = '/fork-black.svg';
		process.env.REACT_APP_FAVICON_URL = '/fork.ico';

		expect(getBrandTitle(PARTNER)).toBe('Fork');
		expect(getLogoUrl(PARTNER)).toBe('/fork.png');
		expect(getDarkLogoUrl(PARTNER)).toBe('/fork-black.svg');
		expect(getFaviconUrl(PARTNER)).toBe('/fork.ico');
	});
});
