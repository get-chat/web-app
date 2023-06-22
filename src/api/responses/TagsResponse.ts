import TagModel from '@src/api/models/TagModel';

class TagsResponse {
	public tags: TagModel[];

	constructor(data: any) {
		const preparedTags: TagModel[] = [];
		data.results.forEach((rawTag: any, rawTagIndex: number) => {
			preparedTags.push(new TagModel(rawTag));
		});
		this.tags = preparedTags;
	}
}

export default TagsResponse;
