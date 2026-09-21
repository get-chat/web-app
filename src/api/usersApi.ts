import axios from './axiosInstance';
import { AxiosRequestConfig } from 'axios';
import { EmptyResponse, PaginatedResponse } from '@src/types/common';
import {
	ChangeUserPasswordRequest,
	CreateUserRequest,
	CreateUserResponse,
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

// Admin only. The response contains an activation_url, which is returned only once.
export const createUser = async (data: CreateUserRequest) => {
	const response = await api.post<CreateUserResponse>('/users/', data);
	return response.data;
};

// Admin only. The create endpoint doesn't accept a password, it is set separately.
export const changeUserPassword = async (
	user_id: number,
	data: ChangeUserPasswordRequest
) => {
	const response = await api.put<EmptyResponse>(
		`/users/${user_id}/password/change/`,
		data
	);
	return response.data;
};
