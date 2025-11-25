import axios from '@src/api/axiosInstance';
import { PaginatedResponse } from '@src/types/common';
import {
	Chat,
	FetchChatsParams,
	ResolveChatRequest,
	ResolveChatResponse,
} from '@src/types/chats';
import {} from '@src/types/users';
import api from '@src/api/axiosInstance';

export const fetchChats = async (
	params: FetchChatsParams,
	dynamic_filters?: { [key: string]: any },
	signal?: AbortSignal
) => {
	const response = await axios.get<PaginatedResponse<Chat>>('/chats/', {
		params: { ...params, ...dynamic_filters },
		signal,
	});
	return response.data;
};

export const fetchChat = async (wa_id: string) => {
	const response = await axios.get<Chat>(`/chats/${wa_id}/`);
	return response.data;
};

export const updateResolved = async (
	wa_id: string,
	data: ResolveChatRequest
) => {
	const response = await api.patch<ResolveChatResponse>(
		`/chats/${wa_id}/resolve`,
		data
	);
	return response.data;
};
