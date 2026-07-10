import axios from '@src/api/axiosInstance';
import { PaginatedResponse } from '@src/types/common';
import { CreateTagRequest, Tag } from '@src/types/tags';

export const fetchTags = async (): Promise<PaginatedResponse<Tag>> => {
	const response = await axios.get<PaginatedResponse<Tag>>('/tags/');
	return response.data;
};

export const createTag = async (data: CreateTagRequest): Promise<Tag> => {
	const response = await axios.post<Tag>('/tags/', data);
	return response.data;
};
