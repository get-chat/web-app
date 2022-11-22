import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import TRANSLATION_EN from './locales/en/translation.json';
import TRANSLATION_TR from './locales/tr/translation.json';
import sprintf from 'i18next-sprintf-postprocessor';

i18n
	// load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
	// learn more: https://github.com/i18next/i18next-http-backend
	// want your translations to be loaded from a professional CDN? => https://github.com/locize/react-tutorial#step-2---use-the-locize-cdn
	.use(Backend)
	// detect user language
	// learn more: https://github.com/i18next/i18next-browser-languageDetector
	.use(LanguageDetector)
	// pass the i18n instance to react-i18next.
	.use(initReactI18next)
	.use(sprintf)
	// init i18next
	// for all options read: https://www.i18next.com/overview/configuration-options
	.init({
		lng: 'en',
		fallbackLng: 'en',
		compatibilityJSON: 'v4',
		debug: false,
		overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
		keySeparator: false,
		nsSeparator: false,
		react: {
			useSuspense: false,
		},
		returnObjects: true,
		returnEmptyString: false,
		// saveMissing: true,
		resources: {
			en: { translation: TRANSLATION_EN },
			tr: { translation: TRANSLATION_TR },
		},
		interpolation: {
			escapeValue: false, // not needed for react as it escapes by default
		},
	});

export default i18n;
