import axios from '@src/api/axiosInstance';
import {
	ChatAssignment,
	UpdateChatAssignmentRequest,
} from '@src/types/chatAssignment';

export const fetchChatAssignment = async (wa_id: string) => {
	const response = await axios.get<ChatAssignment>(
		`/chat_assignment/${wa_id}/`
	);
	return response.data;
};

export const updateChatAssignment = async (
	params: UpdateChatAssignmentRequest
) => {
	const response = await axios.put<ChatAssignment>(
		`/chat_assignment/${params.wa_id}/`,
		{ params }
	);
	return response.data;
};
