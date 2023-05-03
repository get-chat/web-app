import PersonModel from '../models/PersonModel';

class PersonResponse {
	public person: PersonModel;

	constructor(data: any) {
		this.person = new PersonModel(data);
	}
}

export default PersonResponse;
