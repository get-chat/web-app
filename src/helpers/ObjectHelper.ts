// @ts-nocheck
export const getObjLength = (obj) => {
	return obj ? Object.keys(obj).length : 0;
};
export const getFirstObject = (jsonObject) => {
	return jsonObject[Object.keys(jsonObject)[0]];
};
export const getLastObject = (jsonObject) => {
	return jsonObject[
		Object.keys(jsonObject)[Object.keys(jsonObject).length - 1]
	];
};
export const getObjectByIndex = (jsonObject, index) => {
	return jsonObject[Object.keys(jsonObject)[index]];
};
export const getLastKey = (jsonObject) => {
	const keys = Object.keys(jsonObject);
	return keys[keys.length - 1];
};
