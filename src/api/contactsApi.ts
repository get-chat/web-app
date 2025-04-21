import axios from '@src/api/axiosInstance';
import {
	Contact,
	FetchContactsRequest,
	ResolveContactResponse,
} from '@src/types/contacts';
import { PaginatedResponse } from '@src/types/common';

export const resolveContact = async (wa_id: string) => {
	const response = await axios.get<ResolveContactResponse>(
		`/contacts/${wa_id}/`
	);
	return response.data;
};

export const fetchContacts = async (params: FetchContactsRequest) => {
	const response = await axios.get<PaginatedResponse<Contact>>(`/contacts/`, {
		params,
	});
	return response.data;
};
