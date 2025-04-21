import axios from '@src/api/axiosInstance';
import { Person } from '@src/types/persons';

export const retrievePerson = async (wa_id: string) => {
	const response = await axios.get<Person>(`/persons/${wa_id}/`);
	return response.data;
};
