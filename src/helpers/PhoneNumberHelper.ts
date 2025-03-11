export const prepareWaId = (phoneNumber: string | undefined | null) => {
	return phoneNumber?.replace(/[^0-9]/g, '');
};
export const addPlus = (phoneNumber: string | undefined | null) => {
	return phoneNumber?.includes('+') ? phoneNumber : `+${phoneNumber}`;
};
