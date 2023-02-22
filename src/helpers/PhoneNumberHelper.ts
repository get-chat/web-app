// @ts-nocheck
export const prepareWaId = (phoneNumber) => {
	return phoneNumber.replace(/[^0-9]/g, '');
};
export const addPlus = (phoneNumber) => {
	return phoneNumber?.includes('+') ? phoneNumber : `+${phoneNumber}`;
};
