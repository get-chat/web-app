import axios from '@src/api/axiosInstance';
import { PaginatedResponse } from '@src/types/common';
import { FetchMessagesRequest, Message } from '@src/types/messages';

export const fetchMessages = async (params: FetchMessagesRequest) => {
	const response = await axios.get<PaginatedResponse<Message>>('/messages/', {
		params,
	});
	return response.data;
};
