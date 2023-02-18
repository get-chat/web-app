import PersonModel from '../models/PersonModel';

class PersonsResponse {
	constructor(data) {
		const persons = {};
		data.results.forEach((personData, personIndex) => {
			persons[personIndex] = new PersonModel(personData);
		});
		this.persons = persons;
	}
}

export default PersonsResponse;
