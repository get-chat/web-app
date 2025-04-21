import axios from '@src/api/axiosInstance';
import { ResolveContactResponse } from '@src/types/contacts';

export const resolveContact = async (wa_id: string) => {
	const response = await axios.get<ResolveContactResponse>(
		`/contacts/${wa_id}`
	);
	return response.data;
};
