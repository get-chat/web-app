import api from '@src/api/axiosInstance';
import axios from '@src/api/axiosInstance';
import {
	CreateChatTaggingRequest,
	CreateChatTaggingResponse,
	FetchChatTaggingEvent,
	FetchChatTaggingEventsRequest,
} from '@src/types/chatTagging';
import { PaginatedResponse } from '@src/types/common';

export const createChatTagging = async (data: CreateChatTaggingRequest) => {
	const response = await api.post<CreateChatTaggingResponse>(
		'/chat_tagging/',
		data
	);
	return response.data;
};

export const deleteChatTagging = async (id: number) => {
	const response = await api.delete(`/chat_tagging/${id}/`);
	return response.data;
};

export const fetchChatTaggingEvents = async (
	params: FetchChatTaggingEventsRequest
) => {
	const response = await axios.get<PaginatedResponse<FetchChatTaggingEvent>>(
		'/chat_tagging_events/',
		{ params }
	);
	return response.data;
};
