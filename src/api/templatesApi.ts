import api from '@src/api/axiosInstance';
import { PaginatedResponse } from '@src/types/common';
import {
	CheckTemplateRefreshStatusResponse,
	Template,
} from '@src/types/templates';

export const fetchTemplates = async () => {
	const response = await api.get<PaginatedResponse<Template>>('/templates/');
	return response.data;
};

export const checkTemplateRefreshStatus = async (signal?: AbortSignal) => {
	const response = await api.get<CheckTemplateRefreshStatusResponse>(
		'/templates/refresh/status/',
		{ signal }
	);
	return response.data;
};

export const issueTemplateRefreshRequest = async () => {
	return await api.post<void>('/templates/refresh/issue/');
};
