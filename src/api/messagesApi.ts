import api from '@src/api/axiosInstance';
import { ApiResponse, PaginatedResponse } from '@src/types/common';
import {
	CreateMessageRequest,
	CreateMessageResponse,
	FetchMessagesRequest,
	MarkAsReceivedRequest,
	Message,
} from '@src/types/messages';

export const fetchMessages = async (
	params: FetchMessagesRequest,
	signal?: AbortSignal
) => {
	const response = await api.get<PaginatedResponse<Message>>('/messages/', {
		params,
		signal,
	});
	return response.data;
};

export const createMessage = async (data: CreateMessageRequest) => {
	const response = await api.post<CreateMessageResponse>('/messages/', data);
	return {
		status: response.status,
		data: response.data,
	} as ApiResponse<CreateMessageResponse>;
};

export const markAsReceived = async (
	data: MarkAsReceivedRequest,
	signal?: AbortSignal
) => {
	return await api.post('/mark_as_received/', data, { signal });
};
