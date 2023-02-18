// @ts-nocheck
import PersonModel from '../models/PersonModel';

class PersonResponse {
	constructor(data) {
		this.person = new PersonModel(data);
	}
}

export default PersonResponse;
