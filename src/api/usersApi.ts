import axios from './axiosInstance';
import { PaginatedResponse } from '@src/types/common';
import {
	UpdateUserAvailabilityRequest,
	UpdateUserAvailabilityResponse,
	User,
} from '@src/types/users';
import api from './axiosInstance';

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

export const updateUserAvailability = async (
	user_id: number,
	data: UpdateUserAvailabilityRequest
) => {
	const response = await api.patch<UpdateUserAvailabilityResponse>(
		`/users/${user_id}/availability`,
		data
	);
	return response.data;
};
