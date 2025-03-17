import axios from './axiosInstance';
import { PaginatedResponse } from '@src/types/common';
import { User } from '@src/types/user';

export const fetchUsers = async (limit?: number) => {
	const response = await axios.get<PaginatedResponse<User>>('/users/', {
		params: limit ? { limit } : {},
	});
	return response.data;
};

export const fetchCurrentUser = async (): Promise<User> => {
	const response = await axios.get<User>('/users/current/');
	return response.data;
};
