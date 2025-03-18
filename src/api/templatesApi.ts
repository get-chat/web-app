import api from '@src/api/axiosInstance';
import { PaginatedResponse } from '@src/types/common';
import { Template } from '@src/types/templates';

export const fetchTemplates = async () => {
	const response = await api.get<PaginatedResponse<Template>>('/templates/');
	return response.data;
};
