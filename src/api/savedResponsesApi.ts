import api from './axiosInstance';
import {
	CreateSavedResponseRequest,
	CreateSavedResponseResponse,
	SavedResponse,
} from '../types/savedResponses';
import { PaginatedResponse } from '@src/types/common';

export const fetchSavedResponses = async (): Promise<
	PaginatedResponse<SavedResponse>
> => {
	const response = await api.get<PaginatedResponse<SavedResponse>>(
		'/saved_responses/'
	);
	return response.data;
};

export const createSavedResponse = async (
	data: CreateSavedResponseRequest
): Promise<CreateSavedResponseResponse> => {
	const response = await api.post<CreateSavedResponseResponse>(
		'/saved_responses/',
		data
	);
	return response.data;
};

export const deleteSavedResponse = async (id: number): Promise<void> => {
	await api.delete(`/saved_responses/${id}/`);
};
