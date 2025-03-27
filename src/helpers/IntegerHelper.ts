export const parseIntSafely = (input: string | undefined) => {
	return input ? parseInt(input) : undefined;
};
