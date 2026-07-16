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

// Retrieves the auth token using the backend session cookie, if any
export const fetchSessionToken = async () => {
	const response = await api.get<LoginResponse>('/auth/token/current/', {
		// Send the session cookie also when the API runs on another origin (local dev)
		withCredentials: true,
	});
	return response.data;
};

export const changePassword = async (data: ChangePasswordRequest) => {
	const response = await api.put<EmptyResponse>(
		'/users/password/change/',
		data
	);
	return response.data;
};

// Clears the backend session (Django LogoutView, POST-only since Django 5.0)
export const logout = async () => {
	const response = await api.post<EmptyResponse>('/auth/logout/', undefined, {
		// Send the session cookie also when the API runs on another origin (local dev)
		withCredentials: true,
		// Django's LogoutView is CSRF-protected; axios attaches the header
		// for same-origin requests only, cross-origin logout is rejected by
		// Django's CSRF origin check anyway
		xsrfCookieName: 'csrftoken',
		xsrfHeaderName: 'X-CSRFToken',
	});
	return response.data;
};

export const convertRefreshToken = async (data: ConvertRefreshTokenRequest) => {
	const response = await api.post<ConvertRefreshTokenResponse>(
		'/auth/convert_refresh_token/',
		data
	);
	return response.data;
};
