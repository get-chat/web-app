import axios from '@src/api/axiosInstance';
import {
	BusinessProfileSettings,
	PartialUpdateBusinessProfileSettings,
} from '@src/types/settings';

export const fetchBusinessProfileSettings = async () => {
	const response = await axios.get<BusinessProfileSettings>(
		'/settings/business/profile/'
	);
	return response.data;
};

export const partialUpdateBusinessProfileSettings = async (
	params: PartialUpdateBusinessProfileSettings
) => {
	const response = await axios.patch<BusinessProfileSettings>(
		'/settings/business/profile/',
		{ params }
	);
	return response.data;
};
