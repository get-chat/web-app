import axios from '@src/api/axiosInstance';
import { PaginatedResponse } from '@src/types/common';
import { Chat, FetchChatsParams } from '@src/types/chats';

export const fetchChats = async (
	params: FetchChatsParams,
	dynamic_filters?: { [key: string]: any }
) => {
	const response = await axios.get<PaginatedResponse<Chat>>('/chats/', {
		params: { ...params, ...dynamic_filters },
	});
	return response.data;
};
