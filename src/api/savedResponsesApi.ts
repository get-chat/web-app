import api from './axiosInstance';
import {
	CreateSavedResponseRequest,
	CreateSavedResponseResponse,
	FetchSavedResponsesParams,
	SavedResponse,
} from '../types/savedResponses';
import { PaginatedResponse } from '@src/types/common';

export const fetchSavedResponses = async (
	params?: FetchSavedResponsesParams,
	signal?: AbortSignal
) => {
	const response = await api.get<PaginatedResponse<SavedResponse>>(
		'/saved_responses/',
		{
			params: params,
			signal,
		}
	);
	return response.data;
};

export const createSavedResponse = async (data: CreateSavedResponseRequest) => {
	const response = await api.post<CreateSavedResponseResponse>(
		'/saved_responses/',
		data
	);
	return response.data;
};

export const deleteSavedResponse = async (id: number): Promise<void> => {
	await api.delete(`/saved_responses/${id}/`);
};
