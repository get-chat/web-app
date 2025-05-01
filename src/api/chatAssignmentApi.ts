import axios from '@src/api/axiosInstance';
import {
	ChatAssignment,
	ChatAssignmentEvent,
	FetchChatAssignmentEventsRequest,
	PartialUpdateChatAssignmentRequest,
	UpdateChatAssignmentRequest,
} from '@src/types/chatAssignment';
import { PaginatedResponse } from '@src/types/common';

export const fetchChatAssignment = async (wa_id: string) => {
	const response = await axios.get<ChatAssignment>(
		`/chat_assignment/${wa_id}/`
	);
	return response.data;
};

export const updateChatAssignment = async (
	data: UpdateChatAssignmentRequest
) => {
	const response = await axios.put<ChatAssignment>(
		`/chat_assignment/${data.wa_id}/`,
		data
	);
	return response.data;
};

export const fetchChatAssignmentEvents = async (
	params: FetchChatAssignmentEventsRequest
) => {
	const response = await axios.get<PaginatedResponse<ChatAssignmentEvent>>(
		`/chat_assignment_events/`,
		{ params }
	);
	return response.data;
};

export const partialUpdateChatAssignment = async (
	data: PartialUpdateChatAssignmentRequest
) => {
	const response = await axios.patch<ChatAssignment>(
		`/chat_assignment/${data.wa_id}/`,
		data
	);
	return response.data;
};
