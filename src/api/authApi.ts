import api from '@src/api/axiosInstance';
import {
	ChangePasswordRequest,
	LoginRequest,
	LoginResponse,
} from '@src/types/auth';
import { EmptyResponse } from '@src/types/common';

export const login = async (data: LoginRequest) => {
	const response = await api.post<LoginResponse>('/auth/token/', data);
	return response.data;
};

export const changePassword = async (data: ChangePasswordRequest) => {
	const response = await api.put<EmptyResponse>(
		'/users/password/change/',
		data
	);
	return response.data;
};

export const logout = async () => {
	const response = await api.get<EmptyResponse>('/auth/logout/');
	return response.data;
};
