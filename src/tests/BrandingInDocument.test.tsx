import { renderHook } from '@testing-library/react';
import useBrandingInDocument from '@src/hooks/useBrandingInDocument';
import { Branding } from '@src/types/branding';

const { useAppSelector } = require('@src/store/hooks');

const withState = (branding?: Branding, phoneNumber?: string) =>
	useAppSelector.mockImplementation((selector: (state: any) => any) =>
		selector({
			branding: { value: branding },
			phoneNumber: { value: phoneNumber },
		})
	);

const PARTNER: Branding = {
	name: 'Partner Chat',
	favicon_url: 'https://partner.example/favicon.ico',
	logo_url: 'https://partner.example/logo.png',
};

describe('useBrandingInDocument', () => {
	beforeEach(() => {
		document.head.innerHTML = '<link rel="icon" href="/favicon.png" />';
		document.title = 'get.chat Inbox';
	});

	const favicon = () =>
		document.querySelector<HTMLLinkElement>('link[rel="icon"]')!.href;

	it("sets the inbox's title and favicon", () => {
		withState(PARTNER);
		renderHook(() => useBrandingInDocument());

		expect(document.title).toBe('Partner Chat Inbox');
		expect(favicon()).toBe('https://partner.example/favicon.ico');
	});

	it("puts the inbox's number in front of the title", () => {
		withState(PARTNER, '4915100000001');
		renderHook(() => useBrandingInDocument());

		expect(document.title).toBe('+4915100000001 - Partner Chat Inbox');
	});

	it("goes back to the app's own when the branding is gone", () => {
		withState(PARTNER);
		const { rerender } = renderHook(() => useBrandingInDocument());

		withState(undefined);
		rerender();

		expect(document.title).toBe('get.chat Inbox');
		expect(favicon()).toMatch(/\/favicon\.png$/);
	});
});
