import axios from '@src/api/axiosInstance';
import { PaginatedResponse } from '@src/types/common';
import { Group } from '@src/types/groups';

export const fetchGroups = async (): Promise<PaginatedResponse<Group>> => {
	const response = await axios.get<PaginatedResponse<Group>>('/groups/');
	return response.data;
};
