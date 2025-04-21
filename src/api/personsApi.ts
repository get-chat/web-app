import axios from '@src/api/axiosInstance';
import { FetchPersonsRequest, Person } from '@src/types/persons';
import { PaginatedResponse } from '@src/types/common';

export const retrievePerson = async (wa_id: string) => {
	const response = await axios.get<Person>(`/persons/${wa_id}/`);
	return response.data;
};

export const fetchPersons = async (params: FetchPersonsRequest) => {
	const response = await axios.get<PaginatedResponse<Person>>('/persons/', {
		params,
	});
	return response.data;
};
