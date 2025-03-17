import { Tag } from '@src/types/tags';

export const findTagByName = (tags: Tag[], name: string) => {
	return tags?.filter((tagItem) => tagItem.name === name)?.[0];
};
