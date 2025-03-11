import TagModel from '@src/api/models/TagModel';

export const findTagByName = (tags: TagModel[], name: string) => {
	return tags?.filter((tagItem) => tagItem.name === name)?.[0];
};
