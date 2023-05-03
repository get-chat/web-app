import PersonModel from '../models/PersonModel';

export type PersonList = {
	[key: string]: PersonModel;
};

class PersonsResponse {
	public persons: PersonList = {};

	constructor(data: any) {
		const persons: PersonList = {};
		data.results.forEach((personData: any, personIndex: number) => {
			persons[personIndex.toString()] = new PersonModel(personData);
		});
		this.persons = persons;
	}
}

export default PersonsResponse;
