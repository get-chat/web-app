import axios from '@src/api/axiosInstance';
import { BusinessProfileSettings } from '@src/types/settings';

export const fetchBusinessProfileSettings = async () => {
	const response = await axios.get<BusinessProfileSettings>(
		'/settings/business/profile/'
	);
	return response.data;
};
