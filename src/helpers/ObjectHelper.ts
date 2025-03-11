export const getObjLength = (obj?: object) => {
	return obj ? Object.keys(obj).length : 0;
};
export const getFirstObject = (jsonObject: any) => {
	return jsonObject[Object.keys(jsonObject)[0]];
};
export const getLastObject = (jsonObject: any) => {
	return jsonObject[
		Object.keys(jsonObject)[Object.keys(jsonObject).length - 1]
	];
};
export const getObjectByIndex = (jsonObject: any, index: number) => {
	return jsonObject[Object.keys(jsonObject)[index]];
};
export const getLastKey = (jsonObject: object) => {
	const keys = Object.keys(jsonObject);
	return keys[keys.length - 1];
};

export const clone = (instance: object) => {
	const clone = Object.assign({}, instance);
	Object.setPrototypeOf(clone, Object.getPrototypeOf(instance));
	return clone;
};
