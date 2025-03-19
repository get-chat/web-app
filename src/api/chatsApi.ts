import axios from '@src/api/axiosInstance';
import { PaginatedResponse } from '@src/types/common';
import { Chat, FetchChatsParams } from '@src/types/chats';

export const fetchChats = async (params: FetchChatsParams) => {
	const response = await axios.get<PaginatedResponse<Chat>>('/users/', {
		params,
	});
	return response.data;
};
