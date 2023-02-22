// @ts-nocheck
export const findTagByName = (tags, name) => {
	return tags?.filter((tagItem) => tagItem.name === name)?.[0];
};
