export const parseIntSafely = (input: string) => {
	return input ? parseInt(input) : undefined;
};
