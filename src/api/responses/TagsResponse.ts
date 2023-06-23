import TagModel from '@src/api/models/TagModel';

class TagsResponse {
	public tags: TagModel[];

	constructor(data: any) {
		this.tags = data.results.map((rawTag: any) => new TagModel(rawTag));
	}
}

export default TagsResponse;
