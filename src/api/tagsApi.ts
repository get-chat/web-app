import axios from '@src/api/axiosInstance';
import { PaginatedResponse } from '@src/types/common';
import { Tag } from '@src/types/tags';

export const fetchTags = async (): Promise<PaginatedResponse<Tag>> => {
	const response = await axios.get<PaginatedResponse<Tag>>('/tags/');
	return response.data;
};
