import api from '@src/api/axiosInstance';
import {
	CreateChatTaggingRequest,
	CreateChatTaggingResponse,
} from '@src/types/chatTagging';

export const createChatTagging = async (data: CreateChatTaggingRequest) => {
	const response = await api.post<CreateChatTaggingResponse>(
		'/chat_tagging/',
		data
	);
	return response.data;
};
