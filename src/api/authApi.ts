import api from '@src/api/axiosInstance';
import {
	ChangePasswordRequest,
	ConvertRefreshTokenRequest,
	ConvertRefreshTokenResponse,
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

export const convertRefreshToken = async (data: ConvertRefreshTokenRequest) => {
	const response = await api.post<ConvertRefreshTokenResponse>(
		'/auth/convert_refresh_token/',
		data
	);
	return response.data;
};
