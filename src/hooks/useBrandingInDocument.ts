import { useEffect } from 'react';
import { useAppSelector } from '@src/store/hooks';
import { getBrandTitle, getFaviconUrl } from '@src/helpers/BrandingHelper';

// The page title and favicon of the inbox's branding (MT 5.3). The only
// writer of the title: in an inbox it starts with the inbox's number.
const useBrandingInDocument = () => {
	const branding = useAppSelector((state) => state.branding.value);
	const phoneNumber = useAppSelector((state) => state.phoneNumber.value);

	useEffect(() => {
		const title = getBrandTitle(branding);
		document.title = phoneNumber ? `+${phoneNumber} - ${title}` : title;
	}, [branding, phoneNumber]);

	useEffect(() => {
		const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
		if (icon) {
			icon.href = getFaviconUrl(branding);
		}
	}, [branding]);
};

export default useBrandingInDocument;
