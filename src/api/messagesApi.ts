import axios from '@src/api/axiosInstance';
import api from '@src/api/axiosInstance';
import { PaginatedResponse } from '@src/types/common';
import {
	CreateMessageRequest,
	FetchMessagesRequest,
	Message,
} from '@src/types/messages';

export const fetchMessages = async (params: FetchMessagesRequest) => {
	const response = await axios.get<PaginatedResponse<Message>>('/messages/', {
		params,
	});
	return response.data;
};

export const createMessage = async (data: CreateMessageRequest) => {
	const response = await api.post<Message>('/messages/', data);
	return response.data;
};
