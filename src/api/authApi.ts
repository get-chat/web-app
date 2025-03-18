import api from '@src/api/axiosInstance';
import { LoginRequest, LoginResponse } from '@src/types/auth';

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
	const response = await api.post<LoginResponse>('/auth/token/', data);
	return response.data;
};
