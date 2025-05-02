import axios from '@src/api/axiosInstance';
import { FetchPersonsRequest, Person } from '@src/types/persons';
import { PaginatedResponse } from '@src/types/common';

export const retrievePerson = async (wa_id: string, signal?: AbortSignal) => {
	const response = await axios.get<Person>(`/persons/${wa_id}/`, { signal });
	return response.data;
};

export const fetchPersons = async (
	params: FetchPersonsRequest,
	signal?: AbortSignal
) => {
	const response = await axios.get<PaginatedResponse<Person>>('/persons/', {
		params,
		signal,
	});
	return response.data;
};
