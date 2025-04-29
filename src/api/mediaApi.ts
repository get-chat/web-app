import axios from '@src/api/axiosInstance';
import { CreateMediaResponse } from '@src/types/media';

export const createMedia = async (formData: FormData) => {
	const response = await axios.post<CreateMediaResponse>('/media/', {
		formData,
	});
	return response.data;
};
