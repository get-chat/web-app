import { Tag } from '@src/types/tags';

// Default color assigned to tags created from the inbox UI.
// Tag colors can be further customized from the backoffice ("Manage tags").
export const DEFAULT_TAG_COLOR = '#607d8b';

export const findTagByName = (tags: Tag[], name: string) => {
	return tags?.filter((tagItem) => tagItem.name === name)?.[0];
};
