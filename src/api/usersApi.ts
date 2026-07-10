import axios from './axiosInstance';
import { AxiosRequestConfig } from 'axios';
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

export const fetchCurrentUser = async (
	config?: AxiosRequestConfig
): Promise<User> => {
	const response = await axios.get<User>('/users/current/', config);
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
