export const parseIntSafely = (input: string | undefined) => {
	return input ? parseInt(input) : undefined;
};

export const isStringNumber = (str: string): boolean => {
	if (str.trim() === '') {
		return false;
	}

	return !isNaN(Number(str)) && isFinite(Number(str));
};
