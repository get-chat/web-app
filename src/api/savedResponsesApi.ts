import api from './axiosInstance';
import {
	SavedResponsesResponse,
	CreateSavedResponseRequest,
	CreateSavedResponseResponse,
} from '../types/savedResponses';

export const fetchSavedResponses =
	async (): Promise<SavedResponsesResponse> => {
		const response = await api.get<SavedResponsesResponse>('/saved_responses');
		return response.data;
	};

export const createSavedResponse = async (
	data: CreateSavedResponseRequest
): Promise<CreateSavedResponseResponse> => {
	const response = await api.post<CreateSavedResponseResponse>(
		'/saved_responses',
		data
	);
	return response.data;
};

export const deleteSavedResponse = async (id: number): Promise<void> => {
	await api.delete(`/saved_responses/${id}`);
};
