import axios from '@src/api/axiosInstance';
import { ChatAssignment } from '@src/types/chatAssignment';

export const fetchChatAssignment = async (wa_id: string) => {
	const response = await axios.get<ChatAssignment>(
		`/chat_assignment/${wa_id}/`
	);
	return response.data;
};
