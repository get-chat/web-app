const useTranslation = () => ({
	t: (key: string) => key,
	i18n: {
		changeLanguage: jest.fn(),
	},
});

export { useTranslation };
