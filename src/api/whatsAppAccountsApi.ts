import axios from '@src/api/axiosInstance';
import { PaginatedResponse } from '@src/types/common';
import { WhatsAppAccount } from '@src/types/whatsAppAccounts';

export const fetchWhatsAppAccounts = async (this_instance?: boolean) => {
	const response = await axios.get<PaginatedResponse<WhatsAppAccount>>(
		'/whatsapp_accounts/',
		{
			params: this_instance ? { this_instance } : {},
		}
	);
	return response.data;
};
