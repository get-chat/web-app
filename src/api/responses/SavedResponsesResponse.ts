import SavedResponseModel from '@src/api/models/SavedResponseModel';

export type SavedResponseList = {
	[key: string]: SavedResponseModel;
};

class SavedResponsesResponse {
	public savedResponses: SavedResponseList = {};

	constructor(data: any) {
		const savedResponses: SavedResponseList = {};

		data.results.forEach((savedResponse: any) => {
			const prepared = new SavedResponseModel(savedResponse);

			savedResponses[prepared.id.toString()] = prepared;
		});

		this.savedResponses = savedResponses;
	}
}

export default SavedResponsesResponse;
